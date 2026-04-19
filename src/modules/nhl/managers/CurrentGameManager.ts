import { Singleton } from "@common/models/Singleton";

export default class CurrentGameManager extends Singleton {
  private gameId: number | undefined;
  private gameStartTime: Date | undefined;

  constructor() {
    super();
  }

  setGame(gameId: number, gameStartTime: Date): void {
    this.gameId = gameId;
    this.gameStartTime = gameStartTime;
  }

  getGameId(): number | undefined {
    return this.gameId;
  }

  getGameStartTime(): Date | undefined {
    return this.gameStartTime;
  }
}
