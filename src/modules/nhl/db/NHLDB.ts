import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { GameDayPost, gamedayPostsPosts, LiveData, liveData } from "./schema";
import { eq } from "drizzle-orm";

export default class NHLDB extends ModuleDatabase {
  constructor() {
    super("NHL");
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
    return this.select1(gamedayPostsPosts, eq(gamedayPostsPosts.gameId, gameId));
  }

  async hasPostByPostId(postId: string): Promise<boolean> {
    return this.select1(gamedayPostsPosts, eq(gamedayPostsPosts.channelId, postId));
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

  // Live Data
  async ensureLiveDataRowExists(): Promise<void> {
    await this.db.insert(liveData).values({ id: 1 }).onConflictDoNothing();
  }

  async setCurrentGame(gameId: number, gameStartTime: Date): Promise<void> {
    await this.db.update(liveData).set({ gameId, gameStartTime }).where(eq(liveData.id, 1));
  }

  async setCurrentPeriod(period: number): Promise<void> {
    await this.db.update(liveData).set({ currentPeriod: period }).where(eq(liveData.id, 1));
  }

  async clearLiveData(): Promise<void> {
    await this.db.update(liveData).set({ gameId: undefined, gameStartTime: undefined, currentPeriod: undefined }).where(eq(liveData.id, 1));
  }

  async getCurrentLiveData(): Promise<LiveData | undefined> {
    return this.getSingleRow<LiveData>(liveData, eq(liveData.id, 1));
  }
}
