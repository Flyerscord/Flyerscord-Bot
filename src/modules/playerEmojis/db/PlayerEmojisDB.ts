import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { Emoji, playerEmojisEmojis } from "./schema";
import { eq } from "drizzle-orm";

export default class PlayerEmojisDB extends ModuleDatabase {
  constructor() {
    super("PlayerEmojis");
  }

  async addPlayer(playerId: number, emojiId: string): Promise<boolean> {
    const result = await this.db
      .insert(playerEmojisEmojis)
      .values({ playerId, emojiId })
      .onConflictDoUpdate({ target: playerEmojisEmojis.playerId, set: { emojiId, addedAt: new Date() } })
      .returning();

    if (result.length === 0) {
      return false;
    }

    return true;
  }

  async hasPlayer(playerId: number): Promise<boolean> {
    return this.select1(playerEmojisEmojis, eq(playerEmojisEmojis.playerId, playerId));
  }

  async clearPlayers(): Promise<void> {
    await this.truncateTable(playerEmojisEmojis);
  }

  async getAllPlayers(): Promise<Emoji[]> {
    return await this.db.select().from(playerEmojisEmojis);
  }

  async getAllPlayersIds(): Promise<number[]> {
    return (await this.db.select({ playerId: playerEmojisEmojis.playerId }).from(playerEmojisEmojis)).map((player) => player.playerId);
  }
}
