import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { CustomCommand, customCommandsCommands, customCommandsState } from "./schema";
import { eq, sql } from "drizzle-orm";
import Stumper from "stumper";
import PageNotFoundException from "../exceptions/PageNotFoundException";
import { InvalidImgurUrlException } from "../exceptions/InvalidImgurUrlException";
import { ErrorUploadingToImageKitException } from "../exceptions/ErrorUploadingToImageKitException";
import Imgur from "../utils/Imgur";
import ImageKit from "../utils/ImageKit";
import axios from "axios";
import HTMLPageException from "../exceptions/HTMLPageException";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/config/ConfigManager";
import { sleepMs } from "@common/utils/sleep";
import TextCommandManager from "@root/src/common/managers/TextCommandManager";
import { Message } from "discord.js";

export interface IAuditLogInfo {
  oldText: string;
  newText: string;
  commandName: string;
  commandId: number;
}

export enum CustomCommandsActionType {
  ADD = "ADD",
  DELETE = "DELETE",
  EDIT = "EDIT",
}

export default class CustomCommandsDB extends ModuleDatabase {
  constructor() {
    super("CustomCommands");
  }

  async hasCommand(name: string): Promise<boolean> {
    return this.select1(customCommandsCommands, eq(customCommandsCommands.name, name));
  }

  async getCommand(name: string): Promise<CustomCommand | undefined> {
    const command = await this.db.select().from(customCommandsCommands).where(eq(customCommandsCommands.name, name.toLowerCase()));
    if (command.length === 0) {
      return undefined;
    }
    return command[0];
  }

  async getAllCommandNames(): Promise<string[]> {
    return (await this.db.select({ name: customCommandsCommands.name }).from(customCommandsCommands)).map((command) => command.name);
  }

  async getAllCommands(): Promise<CustomCommand[]> {
    return await this.db.select().from(customCommandsCommands);
  }

  async addCommand(name: string, text: string, userId: string): Promise<boolean> {
    if (await this.hasCommand(name)) {
      try {
        text = await this.handleImageUpload(text, userId, name);
      } catch (error) {
        throw error;
      }

      return await this.addCommandSkippingUpload(name, text, userId);
    }
    Stumper.error(`Command ${name} already exists!`, "CustomCommands:CustomCommandsDB:addCommand");
    return false;
  }

  async addCommandSkippingUpload(name: string, text: string, userId: string): Promise<boolean> {
    if (await this.hasCommand(name)) {
      const addedCommand = await this.db
        .insert(customCommandsCommands)
        .values({
          name: name.toLowerCase(),
          text: text,
          createdBy: userId,
          createdOn: new Date(),
        })
        .returning({ id: customCommandsCommands.id });

      await this.addCreateAuditLog(name, text, userId, addedCommand[0].id);

      Stumper.info(`Custom Command created! Command: ${name}  By user: ${userId}`, "customCommands:CustomCommandsDB:addCommandSkippingUpload");

      await this.updateCommandList(await this.getAllCommands());
      return true;
    }
    Stumper.error(`Error adding command: ${name}`, "customCommands:CustomCommandsDB:addCommandSkippingUpload");
    return false;
  }

  async removeCommand(name: string, userId: string): Promise<boolean> {
    if (!(await this.hasCommand(name))) {
      return false;
    }
    const oldCommand = (await this.getCommand(name))!;

    await this.db.delete(customCommandsCommands).where(eq(customCommandsCommands.name, name.toLowerCase()));
    Stumper.info(`Custom Command removed! Command: ${name}  By user: ${userId}`, "customCommands:CustomCommandsDB:deleteCommand");

    await this.addDeleteAuditLog(name, oldCommand.text, userId, oldCommand.id);

    await this.updateCommandList(await this.getAllCommands());
    return true;
  }

  async updateCommand(name: string, text: string, userId: string): Promise<boolean> {
    if (await this.hasCommand(name)) {
      const oldCommand = (await this.getCommand(name))!;

      let newText;
      try {
        newText = await this.handleImageUpload(text, userId, name);
      } catch (error) {
        throw error;
      }

      try {
        await this.db.update(customCommandsCommands).set({ text: newText }).where(eq(customCommandsCommands.name, name.toLowerCase()));
      } catch (error) {
        Stumper.caughtError(error, "customCommands:CustomCommandsDB:updateCommand");
        return false;
      }

      await this.addEditAuditLog(name, oldCommand.text, text, userId, oldCommand.id);

      await this.updateCommandList(await this.getAllCommands());

      return true;
    }
    return false;
  }

  private async handleImageUpload(text: string, userId: string, name: string): Promise<string> {
    if (this.isImageLink(text)) {
      let isUrlValid: boolean;
      try {
        isUrlValid = await this.isUrlValid(text);
      } catch (error) {
        throw error;
      }

      if (!isUrlValid) {
        // Check if the url is a discord url and if it is, there is a chance that the url is old and needs to be updated
        const discordRegex = /discordapp.com/;
        if (!discordRegex.test(text)) {
          throw new PageNotFoundException();
        }

        const newText = await this.getNewDiscordUrl(text);

        if (newText) {
          text = newText;
        } else {
          throw new PageNotFoundException();
        }
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
        // Check the content type
        const htmlContentTypeRegex = /text\/html/;
        if (response.headers["content-type"].match(htmlContentTypeRegex)) {
          Stumper.error(`Url ${url} is a HTML page and not an image`, "customCommands:CustomCommandsDB:isUrlValid");
          throw new HTMLPageException();
        }

        Stumper.debug(`Url ${url} is valid`, "customCommands:CustomCommandsDB:isUrlValid");
        return true;
      }
      Stumper.debug(`Url ${url} is not valid. Status code: ${response.status}`, "customCommands:CustomCommandsDB:isUrlValid");
      return false;
    } catch (error) {
      if (error instanceof HTMLPageException) {
        throw error;
      }
      return false;
    }
  }

  private async getNewDiscordUrl(url: string): Promise<string | undefined> {
    const message = await discord.messages.sendMessageToChannel(ConfigManager.getInstance().getConfig("CustomCommands").commandTempChannelId, url);

    if (!message) {
      return undefined;
    }

    await sleepMs(100);

    if (message.embeds.length == 0) {
      await message.delete();
      return undefined;
    }

    const newUrl = message.embeds[0].data.thumbnail?.url;

    if (!newUrl || newUrl == url) {
      await message.delete();
      return undefined;
    }

    const newValid = await this.isUrlValid(newUrl);

    if (!newValid) {
      await message.delete();
      return undefined;
    }

    await message.delete();
    return newUrl;
  }

  private async addCreateAuditLog(name: string, text: string, userId: string, commandId: number): Promise<void> {
    const info: IAuditLogInfo = {
      oldText: "",
      newText: text,
      commandName: name,
      commandId: commandId,
    };

    await this.createAuditLog({
      action: CustomCommandsActionType.ADD,
      userId: userId,
      details: info,
    });
  }

  private async addEditAuditLog(name: string, oldText: string, newText: string, userId: string, commandId: number): Promise<void> {
    const info: IAuditLogInfo = {
      oldText: oldText,
      newText: newText,
      commandName: name,
      commandId: commandId,
    };

    await this.createAuditLog({
      action: CustomCommandsActionType.EDIT,
      userId: userId,
      details: info,
    });
  }

  private async addDeleteAuditLog(name: string, oldText: string, userId: string, commandId: number): Promise<void> {
    const info: IAuditLogInfo = {
      oldText: oldText,
      newText: "",
      commandName: name,
      commandId: commandId,
    };

    await this.createAuditLog({
      action: CustomCommandsActionType.DELETE,
      userId: userId,
      details: info,
    });
  }

  async getCommandListMessageIds(): Promise<string[]> {
    return (
      await this.db
        .select({ commandListMessageIds: customCommandsState.messageIds })
        .from(customCommandsState)
        .where(eq(customCommandsState.key, "commandListMessageId"))
    )[0].commandListMessageIds;
  }

  async removeAllCommandListMessageIds(): Promise<void> {
    await this.db.update(customCommandsState).set({ messageIds: [] }).where(eq(customCommandsState.key, "commandListMessageId"));
  }

  async addCommandListMessageId(messageId: string): Promise<void> {
    await this.db
      .update(customCommandsState)
      .set({ messageIds: sql`array_append(${customCommandsState.messageIds}, ${messageId})` })
      .where(eq(customCommandsState.key, "commandListMessageId"));
  }

  async removeCommandListMessageId(messageId: string): Promise<void> {
    await this.db
      .update(customCommandsState)
      .set({ messageIds: sql`array_remove(${customCommandsState.messageIds}, ${messageId})` })
      .where(eq(customCommandsState.key, "commandListMessageId"));
  }

  async updateCommandList(allCommands: CustomCommand[]): Promise<void> {
    const db = new CustomCommandsDB();

    const commandListMessageIds = await db.getCommandListMessageIds();

    const config = ConfigManager.getInstance().getConfig("CustomCommands");
    const commandListChannelId = config.customCommandListChannelId;

    const textCommandManager = TextCommandManager.getInstance();
    const hardcodedCommands = textCommandManager.getCommands().filter((value) => value.prefix == config.prefix);
    const hardcodedCommandsCustom: Omit<CustomCommand, "id">[] = hardcodedCommands.map((command) => {
      return {
        name: command.name,
        text: command.command,
        createdBy: "System",
        createdOn: new Date(),
      };
    });

    let commands = [...hardcodedCommandsCustom, ...allCommands];
    commands = commands.sort((a, b) => a.name.localeCompare(b.name));
    const commandListMessages = this.createCommandListMessages(commands);

    // Check on status of all command list messages
    let allCommandListMessagesExist = commandListMessageIds.length > 0;
    let existingCommandMessages: Message[] = [];
    for (const commandListMessageId of commandListMessageIds) {
      const message = await discord.messages.getMessage(commandListChannelId, commandListMessageId);
      if (!message) {
        allCommandListMessagesExist = false;
      } else {
        existingCommandMessages.push(message);
      }
    }

    if (!allCommandListMessagesExist) {
      // Delete all existing command list messages, if any
      for (const message of existingCommandMessages) {
        await message.delete();
      }
      await db.removeAllCommandListMessageIds();

      // The command list message does not exist and need to be made
      for (const commandListMessage of commandListMessages) {
        const message = await discord.messages.sendMessageToChannel(commandListChannelId, commandListMessage);
        if (message) {
          await db.addCommandListMessageId(message.id);
        }
      }
    } else {
      if (commandListMessages.length > existingCommandMessages.length) {
        for (const message of existingCommandMessages) {
          await message.delete();
        }
        await db.removeAllCommandListMessageIds();

        for (let i = 0; i < commandListMessages.length; i++) {
          const message = await discord.messages.sendMessageToChannel(commandListChannelId, commandListMessages[i]);
          if (message) {
            await db.addCommandListMessageId(message.id);
          }
        }
      } else if (commandListMessages.length < existingCommandMessages.length) {
        for (let i = 0; i < existingCommandMessages.length; i++) {
          if (i >= commandListMessages.length) {
            await existingCommandMessages[i].delete();
            await db.removeCommandListMessageId(existingCommandMessages[i].id);
          } else {
            await existingCommandMessages[i].edit(commandListMessages[i]);
          }
        }
      } else {
        for (let i = 0; i < existingCommandMessages.length; i++) {
          await existingCommandMessages[i].edit(commandListMessages[i]);
        }
      }
    }
  }

  createCommandListMessages(commands: Omit<CustomCommand, "id">[]): string[] {
    let output = `**Custom Commands (${commands.length} commands)**\n`;
    const prefix = ConfigManager.getInstance().getConfig("CustomCommands").prefix;

    let outputStrings: string[] = [];

    let textLength = output.length;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const commandText = `${prefix}${command.name}\n`;

      if (textLength + commandText.length > 2000) {
        outputStrings.push(output);
        output = "";
        textLength = 0;
      }

      output += commandText;
      textLength += commandText.length;
    }

    outputStrings.push(output);
    return outputStrings;
  }
}
