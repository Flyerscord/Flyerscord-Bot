import Database from "../../../common/providers/Database";

export default class PlayerEmojisDB extends Database {
  private static instance: PlayerEmojisDB;

  private constructor() {
    super({ name: "player-emojis" });
  }

  public static getInstance(): PlayerEmojisDB {
    return this.instance || (this.instance = new this());
  }

  public addPlayer(playerName: number, emojiId: string): boolean {
    if (!this.hasPlayer(playerName)) {
      this.db.set(playerName, emojiId);
      return true;
    }
    return false;
  }

  public hasPlayer(playerName: number): boolean {
    return this.db.has(playerName);
  }

  public clearPlayers(): void {
    this.db.clear();
  }

  public getAllPlayers(): Array<string> {
    return this.getAllValues();
  }

  public getAllPlayersIds(): Array<number> {
    return this.getAllKeys() as Array<number>;
  }
}
