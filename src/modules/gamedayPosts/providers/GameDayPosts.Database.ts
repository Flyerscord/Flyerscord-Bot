import Database from "../../../common/providers/Database";
import IGameDayPost from "../interfaces/GameDayPost";

export default class GameDayPostsDB extends Database {
  private static instance: GameDayPostsDB;

  private constructor() {
    super({ name: "game-day-posts" });
  }

  static getInstance(): GameDayPostsDB {
    return this.instance || (this.instance = new this());
  }

  public addPost(gameId: number, postId: string): void {
    const post: IGameDayPost = { channelId: postId, gameId: gameId };
    this.db.set(gameId.toString(), post);
  }

  public hasPostByGameId(gameId: number): boolean {
    return this.db.has(gameId.toString());
  }

  public hasPostByPostId(postId: string): boolean {
    return this.db.some((post) => post.channelId == postId);
  }

  public getPostByGameId(gameId: number): IGameDayPost | undefined {
    if (this.hasPostByGameId(gameId)) {
      return this.db.get(gameId.toString());
    }
    return undefined;
  }

  public getPostByPostId(postId: string): IGameDayPost | undefined {
    return this.db.find((post) => post.channelId == postId);
  }

  public getAllPost(): Array<IGameDayPost> {
    return this.getAllValues();
  }

  public getAllPostIds(): Array<string> {
    return this.db.map((post) => post.channelId);
  }
}
