import Database from "./Database";
import IUserLevel from "../interfaces/Levels";
import Levels from "../util/Levels";

export default class UserLevelsDB extends Database {
  private static instance: UserLevelsDB;

  private constructor() {
    super({ name: "user-levels" });
  }

  static getInstance(): UserLevelsDB {
    return this.instance || (this.instance = new this());
  }

  addMessage(userId: string): void {
    this.addUser(userId);
    const userLevel = this.getUser(userId);

    const expToAdd = Levels.getRandomExpAmount();
    const expForNextLevel = Levels.getExpForNextLevel(userLevel.level);

    let currentExp = userLevel.exp;
    currentExp += expToAdd;

    this.db.inc(userId, "messages");
    this.db.update(userId, { exp: currentExp });

    if (currentExp >= expForNextLevel) {
      this.db.inc(userId, "level");
    }
  }

  getUser(userId: string): IUserLevel {
    if (this.hasUser(userId)) {
      return this.db.get(userId);
    }
    return {
      userId: userId,
      messages: 0,
      exp: 0,
      level: 0,
    };
  }

  getAllUsers(): Array<IUserLevel> {
    return this.getAllValues();
  }

  private hasUser(userId: string): boolean {
    return this.db.has(userId);
  }

  private addUser(userId: string): boolean {
    if (!this.hasUser(userId)) {
      const userLevel: IUserLevel = { userId: userId, messages: 0, exp: 0, level: 0 };
      this.db.set(userId, userLevel);
      return true;
    }
    return false;
  }
}
