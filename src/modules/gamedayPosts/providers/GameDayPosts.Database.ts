import Database from "@common/providers/Database";
import IGameDayPost from "../interfaces/GameDayPost";

export default class GameDayPostsDB extends Database {
  constructor() {
    super({ name: "game-day-posts" });
  }

  addPost(gameId: number, postId: string): void {
    const post: IGameDayPost = { channelId: postId, gameId: gameId };
    this.db.set(gameId.toString(), post);
  }

  hasPostByGameId(gameId: number): boolean {
    return this.db.has(gameId.toString());
  }

  hasPostByPostId(postId: string): boolean {
    return this.db.some((post) => post.channelId == postId);
  }

  getPostByGameId(gameId: number): IGameDayPost | undefined {
    if (this.hasPostByGameId(gameId)) {
      return this.db.get(gameId.toString());
    }
    return undefined;
  }

  getPostByPostId(postId: string): IGameDayPost | undefined {
    return this.db.find((post) => post.channelId == postId);
  }

  getAllPost(): IGameDayPost[] {
    return this.getAllValues();
  }

  getAllPostIds(): string[] {
    return this.db.map((post) => post.channelId);
  }
}
