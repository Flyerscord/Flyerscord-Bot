import { Singleton } from "@common/models/Singleton";
import discord from "@common/utils/discord/discord";
import { ErrorUploadingToImageKitException } from "../exceptions/ErrorUploadingToImageKitException";
import { InvalidImgurUrlException } from "../exceptions/InvalidImgurUrlException";
import PageNotFoundException from "../exceptions/PageNotFoundException";
import CustomCommandsDB from "../db/CustomCommandsDB";

export default class CommandImporter extends Singleton {
  private enabled: boolean;
  private name: string;
  private text: string;
  private channelId: string;
  private userId: string;
  private botId: string;
  private prefix: string;

  constructor() {
    super();
    this.enabled = false;
    this.name = "";
    this.text = "";
    this.channelId = "";
    this.userId = "";
    this.botId = "";
    this.prefix = "";
  }

  enable(channelId: string, userId: string, botId: string, prefix: string): void {
    this.channelId = channelId;
    this.enabled = true;
    this.userId = userId;
    this.botId = botId;
    this.prefix = prefix;
  }

  disable(): void {
    this.enabled = false;
    this.name = "";
    this.text = "";
    this.channelId = "";
    this.userId = "";
    this.botId = "";
    this.prefix = "";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getUserId(): string {
    return this.userId;
  }

  getChannelId(): string {
    return this.channelId;
  }

  getBotId(): string {
    return this.botId;
  }

  setNewCommandName(name: string): void {
    this.name = name.replace(this.prefix, "").toLowerCase();
  }

  getNewCommandName(): string {
    return this.name;
  }

  async setNewCommandText(text: string): Promise<void> {
    this.text = text;
    await this.createCommand();
  }

  getNewCommandText(): string {
    return this.text;
  }

  private async createCommand(): Promise<void> {
    if (this.name == "" || this.text == "") {
      await discord.messages.sendMessageToChannel(this.channelId, "Error creating command! Name or text is missing!");
      return;
    }

    const db = new CustomCommandsDB();
    if (await db.hasCommand(this.name)) {
      await discord.messages.sendMessageToChannel(this.channelId, `Command ${this.name} already exists!`);
      return;
    }

    try {
      await db.addCommand(this.name, this.text, this.userId);
    } catch (error) {
      if (error instanceof InvalidImgurUrlException || error instanceof ErrorUploadingToImageKitException) {
        await discord.messages.sendMessageToChannel(this.channelId, "Error creating command! There was an issue with the url.");
      } else if (error instanceof PageNotFoundException) {
        await discord.messages.sendMessageToChannel(this.channelId, "Error creating command! The url returns a 404.");
      } else {
        await discord.messages.sendMessageToChannel(this.channelId, "Error creating command!");
      }
    }
  }
}
