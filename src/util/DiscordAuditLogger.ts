// Send messages about custom commands being added, removed, and updated to the audit log channel
// Send messages about leveling to the audit log channel

import { APIEmbedField, Client, EmbedBuilder, GuildMember } from "discord.js";
import { DiscordAuditSetupRequiredException } from "../exceptions/DiscordAuditSetupRequiredException";
import discord from "./discord/discord";
import { IAuditLoggerType } from "../interfaces/DiscordAuditLogger";

// Send messages about the user management (warnings, mutes, notes) to the audit log channel
export default class DiscordAuditLogger {
  private static instance: DiscordAuditLogger;

  private channelId: string;
  private client: Client | undefined;

  private constructor() {
    this.channelId = "";
    this.client = undefined;
  }

  static getInstance(): DiscordAuditLogger {
    return this.instance || (this.instance = new this());
  }

  public setChannelId(channelId: string): void {
    this.channelId = channelId;
  }

  public setClient(client: Client): void {
    this.client = client;
  }

  public customCommandCreated(commandName: string, member: GuildMember): void {
    const fields: Array<APIEmbedField> = [];
    const type: IAuditLoggerType = {
      name: "Custom Command Created",
      color: "Gold",
    };
    const embed = discord.embeds.getAuditLogEmbed(member, type, fields);
    this.sendEmbed(embed);
  }

  private sendEmbed(embed: EmbedBuilder): void {
    if (this.channelId == "" || !this.client) {
      throw new DiscordAuditSetupRequiredException();
    }
    discord.messages.sendEmbedToChannel(this.client, this.channelId, embed);
  }
}
