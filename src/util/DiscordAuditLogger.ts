// Send messages about custom commands being added, removed, and updated to the audit log channel
// Send messages about leveling to the audit log channel

import { Client } from "discord.js";

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

  public static info(message: string): void {}

  private sendMessageToChannel(message: string): void {
    this.client.channels.cache.get();
  }
}
