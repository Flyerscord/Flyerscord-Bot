import Stumper from "stumper";
import Time from "../../../common/utils/Time";

import Database from "../../../common/providers/Database";
import ICustomCommand, { ICustomCommandHistory } from "../interfaces/ICustomCommand";
import { updateCommandList } from "../utils/util";
import Imgur from "../utils/Imgur";
import axios from "axios";

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

  getAllCommandNames(): Array<string> {
    return this.getAllKeys() as Array<string>;
  }

  async addCommand(name: string, text: string, userId: string): Promise<boolean> {
    if (!this.hasCommand(name)) {
      if (this.isImageLink(text)) {
        text = await this.formatImgurUrl(text);
        const imgur = Imgur.getInstance();
        const imgurLink = await imgur.uploadImage(text, `Flyerscord cmd: ${name}`);
        if (imgurLink) {
          text = imgurLink;
        }
      }

      const customCommand: ICustomCommand = {
        name: name.toLowerCase(),
        text: text,
        createdBy: userId,
        createdOn: Time.getCurrentTime(),
        history: [],
      };
      this.db.set(name, customCommand);
      Stumper.info(`Custom Command created! Command: ${name}  By user: ${userId}`, "CustomCommandsDB:addCommand");

      updateCommandList();
      return true;
    }
    Stumper.error(`Error adding command: ${name}`, "CustomCommandsDB:addCommand");
    return false;
  }

  removeCommand(name: string, userId: string): boolean {
    if (!this.hasCommand(name)) {
      return false;
    }
    this.db.delete(name);
    Stumper.info(`Custom Command removed! Command: ${name}  By user: ${userId}`, "CustomCommandsDB:deleteCommand");

    updateCommandList();
    return true;
  }

  updateCommand(name: string, text: string, userId: string): boolean {
    if (this.hasCommand(name)) {
      const oldCommand = this.getCommand(name)!;
      const newCommand = this.updateObject(oldCommand, text, userId);
      this.db.set(name, newCommand);
      return true;
    }
    return false;
  }

  getAllCommands(): Array<ICustomCommand> {
    return this.getAllValues();
  }

  private updateObject(oldCommand: ICustomCommand, newText: string, editUser: string): ICustomCommand {
    const newCommand = oldCommand;

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

  private isImageLink(text: string): boolean {
    const urlPattern = /^(https?:\/\/[^\s]+)$/g;

    const urls = text.match(urlPattern);

    if (urls && urls.length > 0) {
      return true;
    }
    return false;
  }

  private async formatImgurUrl(url: string): Promise<string> {
    const imgurRegex = /^https?:\/\/(www\.)?imgur\.com\/([a-zA-Z0-9]+)$/;
    const match = url.match(imgurRegex);

    if (!match) {
      console.log("Invalid Imgur URL format.");
      return url;
    }

    const imageId = match[2];
    const extensions = [".jpg", ".png", ".gif"];

    for (const ext of extensions) {
      const directUrl = `https://i.imgur.com/${imageId}${ext}`;
      try {
        const response = await axios.head(directUrl);
        if (response.headers["content-type"].startsWith("image/")) {
          // If a valid image type is found, return the direct URL
          return directUrl;
        }
      } catch (error) {
        // Continue to the next extension if this one fails
        console.log(`Attempt with ${ext} failed:`, error);
      }
    }

    console.log("Failed to retrieve a valid image URL.");
    return url;
  }
}
