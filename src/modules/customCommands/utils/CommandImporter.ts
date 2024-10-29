import discord from "../../../common/utils/discord/discord.js";
import CustomCommandsDB from "../providers/CustomCommands.Database";

export default class CommandImporter {
  private static instance: CommandImporter;

  private enabled: boolean;
  private name: string;
  private text: string;
  private channelId: string;
  private userId: string;
  private botId: string;
  private prefix: string;

  private constructor() {
    this.enabled = false;
    this.name = "";
    this.text = "";
    this.channelId = "";
    this.userId = "";
    this.botId = "";
    this.prefix = "";
  }

  public static getInstance(): CommandImporter {
    return this.instance || (this.instance = new this());
  }

  public enable(channelId: string, userId: string, botId: string, prefix: string): void {
    this.channelId = channelId;
    this.enabled = true;
    this.userId = userId;
    this.botId = botId;
    this.prefix = prefix;
  }

  public disable(): void {
    this.enabled = false;
    this.name = "";
    this.text = "";
    this.channelId = "";
    this.userId = "";
    this.botId = "";
    this.prefix = "";
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getChannelId(): string {
    return this.channelId;
  }

  public getBotId(): string {
    return this.botId;
  }

  public setNewCommandName(name: string): void {
    this.name = name.replace(this.prefix, "").toLowerCase();
  }

  public getNewCommandName(): string {
    return this.name;
  }

  public setNewCommandText(text: string): void {
    this.text = text;
    this.createCommand();
  }

  public getNewCommandText(): string {
    return this.text;
  }

  private createCommand(): void {
    if (this.name == "" || this.text == "") {
      discord.messages.sendMessageToChannel(this.channelId, "Error creating command! Name or text is missing!");
      return;
    }

    const db = CustomCommandsDB.getInstance();
    if (db.hasCommand(this.name)) {
      discord.messages.sendMessageToChannel(this.channelId, `Command ${this.name} already exists!`);
      return;
    }
    db.addCommand(this.name, this.text, this.userId);
  }
}
