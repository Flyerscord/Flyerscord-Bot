import Cache from "@common/models/Cache";
import LevelsDB from "../db/LevelsDB";
import discord from "@common/utils/discord/discord";
import { Collection, GuildMember } from "discord.js";

interface ILeaderboardCache {
  username: string;
}

export default class LeaderboardCache extends Cache<Map<string, ILeaderboardCache | undefined>> {
  private members: Collection<string, GuildMember>;

  constructor() {
    // Run every 2 hours
    super("LeaderboardCache", "0 0 */2 * * *", new Map());
    this.members = new Collection();
  }

  getUsername(userId: string): string | undefined {
    return this.cache.get(userId)?.username;
  }

  protected async updateCache(): Promise<void> {
    const db = new LevelsDB();

    await db.createAuditLog({
      action: "updateLeaderboardCache",
    });

    const users = await db.getAllUsersSortedByExp();
    this.setMembers(await discord.members.getMembers(true));
    await Promise.all(users.map((user) => this.getMemberUsername(user.userId)));
  }

  private async getMemberUsername(userId: string): Promise<void> {
    const member = this.getMember(userId);
    if (member) {
      const username = member.displayName || member.user.username;
      this.cache.set(userId, { username });
    }
  }

  private setMembers(members: Collection<string, GuildMember> | undefined): void {
    if (members) {
      this.members = members;
    }
  }

  private getMember(userId: string): GuildMember | undefined {
    return this.members.find((member) => member.user.id == userId);
  }
}
