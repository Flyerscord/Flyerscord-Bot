import Stumper from "stumper";
import Time from "../../../common/utils/Time";

import Database from "../../../common/providers/Database";
import ICustomCommand, { ICustomCommandHistory } from "../interfaces/ICustomCommand";
import { updateCommandList } from "../utils/util";
import ImageKit from "../utils/ImageKit";
import axios from "axios";
import Imgur from "../utils/Imgur";
import { InvalidImgurUrlException } from "../exceptions/InvalidImgurUrlException";
import { ErrorUploadingToImageKitException } from "../exceptions/ErrorUploadingToImageKitException";
import PageNotFoundException from "../exceptions/PageNotFoundException";

export default class CustomCommandsDB extends Database {
  private static instance: CustomCommandsDB;

  private constructor() {
    super({ name: "custom-commands" });
  }

  static getInstance(): CustomCommandsDB {
    return this.instance || (this.instance = new this());
  }

  hasCommand(name: string): boolean {
    return this.db.has(name);
  }

  getCommand(name: string): ICustomCommand | undefined {
    if (!this.hasCommand(name)) {
      return undefined;
    }
    return this.db.get(name.toLowerCase());
  }

  getAllCommandNames(): string[] {
    return this.getAllKeys() as string[];
  }

  async addCommand(name: string, text: string, userId: string): Promise<boolean> {
    if (!this.hasCommand(name)) {
      try {
        text = await this.handleImageUpload(text, userId, name);
      } catch (error) {
        throw error;
      }

      const customCommand: ICustomCommand = {
        name: name.toLowerCase(),
        text: text,
        createdBy: userId,
        createdOn: Time.getCurrentTime(),
        history: [],
      };
      this.db.set(name, customCommand);
      Stumper.info(`Custom Command created! Command: ${name}  By user: ${userId}`, "common:CustomCommandsDB:addCommand");

      updateCommandList();
      return true;
    }
    Stumper.error(`Error adding command: ${name}`, "common:CustomCommandsDB:addCommand");
    return false;
  }

  removeCommand(name: string, userId: string): boolean {
    if (!this.hasCommand(name)) {
      return false;
    }
    this.db.delete(name);
    Stumper.info(`Custom Command removed! Command: ${name}  By user: ${userId}`, "common:CustomCommandsDB:deleteCommand");

    updateCommandList();
    return true;
  }

  async updateCommand(name: string, text: string, userId: string): Promise<boolean> {
    if (this.hasCommand(name)) {
      const oldCommand = this.getCommand(name)!;

      let newCommand: ICustomCommand;
      try {
        newCommand = await this.updateObject(oldCommand, text, userId);
      } catch (error) {
        throw error;
      }
      this.db.set(name, newCommand);
      return true;
    }
    return false;
  }

  getAllCommands(): ICustomCommand[] {
    return this.getAllValues();
  }

  private async updateObject(oldCommand: ICustomCommand, newText: string, editUser: string): Promise<ICustomCommand> {
    const newCommand = oldCommand;

    try {
      newText = await this.handleImageUpload(newText, editUser, oldCommand.name);
    } catch (error) {
      throw error;
    }

    const historyEntry: ICustomCommandHistory = {
      oldText: oldCommand.text,
      newText: newText,
      editedBy: editUser,
      editedOn: Time.getCurrentTime(),
      index: oldCommand.history.length,
    };

    newCommand.text = newText;
    newCommand.history.push(historyEntry);
    return newCommand;
  }

  private async handleImageUpload(text: string, userId: string, name: string): Promise<string> {
    if (this.isImageLink(text)) {
      if (!(await this.isUrlValid(text))) {
        throw new PageNotFoundException();
      }

      if (text.match(/imgur.com/)) {
        const imgurRes = await Imgur.getInstance().getImageUrlForImgurUrl(text);
        if (imgurRes) {
          text = imgurRes;
        } else {
          throw new InvalidImgurUrlException();
        }
      }
      const imageKit = ImageKit.getInstance();
      const imageLink = await imageKit.uploadImage(text, `flyerscord-cmd-${name}`, userId, name);
      if (imageLink) {
        text = imageLink;
      } else {
        throw new ErrorUploadingToImageKitException();
      }
    }

    return text;
  }

  private isImageLink(text: string): boolean {
    const urlPattern = /^(https?:\/\/[^\s]+)$/g;
    const youtubeRegex =
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?/;

    const urlMatch = urlPattern.test(text);
    const youtubeMatch = youtubeRegex.test(text);

    return urlMatch && !youtubeMatch;
  }

  private async isUrlValid(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url);
      if (response.status == 200) {
        Stumper.debug(`Url ${url} is valid`, "customCommands:CustomCommandsDB:isUrlValid");
        return true;
      }
      Stumper.debug(`Url ${url} is not valid. Status code: ${response.status}`, "customCommands:CustomCommandsDB:isUrlValid");
      return false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }
}
