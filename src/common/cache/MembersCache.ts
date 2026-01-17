import { Collection, GuildMember } from "discord.js";
import Cache from "../models/Cache";
import discord from "../utils/discord/discord";
import Stumper from "stumper";

export default class MembersCache extends Cache<Collection<string, GuildMember> | undefined> {
  constructor() {
    // Run every hour
    super("MembersCache", "0 0 * * * *", new Collection());
  }

  protected async updateCache(): Promise<void> {
    const members = await discord.members.forceGetMembers();
    if (!members) {
      Stumper.error("0 members found", "common:MembersCache:updateCache");
      return;
    }
    this.cache = members;
  }

  getMember(userId: string): GuildMember | undefined {
    return this.cache?.get(userId);
  }
}
