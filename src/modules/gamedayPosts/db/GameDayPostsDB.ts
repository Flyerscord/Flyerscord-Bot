import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { GameDayPost, gamedayPostsPosts } from "./schema";
import { eq, sql } from "drizzle-orm";

export default class GameDayPostsDB extends ModuleDatabase {
  constructor() {
    super("GameDayPosts");
  }

  async addPost(gameId: number, postId: string): Promise<void> {
    await this.db
      .insert(gamedayPostsPosts)
      .values({ gameId: gameId, channelId: postId })
      .onConflictDoUpdate({
        target: gamedayPostsPosts.gameId,
        set: {
          channelId: postId,
        },
      });
  }

  async hasPostByGameId(gameId: number): Promise<boolean> {
    return (
      (
        await this.db
          .select({ one: sql<number>`1` })
          .from(gamedayPostsPosts)
          .where(eq(gamedayPostsPosts.gameId, gameId))
      ).length > 0
    );
  }

  async hasPostByPostId(postId: string): Promise<boolean> {
    return (
      (
        await this.db
          .select({ one: sql<number>`1` })
          .from(gamedayPostsPosts)
          .where(eq(gamedayPostsPosts.channelId, postId))
      ).length > 0
    );
  }

  async getPostByGameId(gameId: number): Promise<GameDayPost | undefined> {
    const post = await this.db.select().from(gamedayPostsPosts).where(eq(gamedayPostsPosts.gameId, gameId));
    if (post.length === 0) {
      return undefined;
    }
    return post[0];
  }

  async getPostByPostId(postId: string): Promise<GameDayPost | undefined> {
    const post = await this.db.select().from(gamedayPostsPosts).where(eq(gamedayPostsPosts.channelId, postId));
    if (post.length === 0) {
      return undefined;
    }
    return post[0];
  }

  async getAllPost(): Promise<GameDayPost[]> {
    return await this.db.select().from(gamedayPostsPosts);
  }

  async getAllPostIds(): Promise<string[]> {
    return (await this.db.select({ channelId: gamedayPostsPosts.channelId }).from(gamedayPostsPosts)).map((post) => post.channelId);
  }
}
