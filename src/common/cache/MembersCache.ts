import { Collection, GuildMember } from "discord.js";
import Cache from "../models/Cache";
import { getGuild } from "../utils/discord/guilds";
import Stumper from "stumper";

export default class MembersCache extends Cache<Collection<string, GuildMember> | undefined> {
  constructor() {
    // Run every hour
    super("MembersCache", "0 0 * * * *", new Collection());
  }

  protected async updateCache(): Promise<void> {
    const members = await this.forceGetMembers();
    if (!members) {
      Stumper.error("0 members found", "common:MembersCache:updateCache");
      return;
    }
    Stumper.info(`Found ${members.size} members`, "common:MembersCache:updateCache");
    this.cache = members;
  }

  getMember(userId: string): GuildMember | undefined {
    return this.cache?.get(userId);
  }

  private async forceGetMembers(): Promise<Collection<string, GuildMember> | undefined> {
    try {
      const guild = getGuild();
      if (!guild) {
        Stumper.error("Error finding guild", "common:members:forceGetMembers");
        return undefined;
      }
      guild.members.cache.clear();
      return await guild.members.fetch();
    } catch (error) {
      Stumper.caughtError(error, "common:members:forceGetMembers");
      return undefined;
    }
  }
}
