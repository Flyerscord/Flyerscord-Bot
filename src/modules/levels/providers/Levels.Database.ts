import Database from "../../../common/providers/Database.js";
import { IUserLevel } from "../interfaces/IUserLevel.js";

export default class LevelsDB extends Database {
  private static instance: LevelsDB;

  private constructor() {
    super({
      name: "user-levels",
    });
  }

  public static getInstance(): LevelsDB {
    if (!LevelsDB.instance) {
      LevelsDB.instance = new LevelsDB();
    }
    return LevelsDB.instance;
  }

  public hasUser(userId: string): boolean {
    return this.db.has(userId);
  }

  public getUser(userId: string): IUserLevel | undefined {
    if (this.hasUser(userId)) {
      return this.db.get(userId);
    }
    return undefined;
  }

  public addNewUser(userId: string): IUserLevel {
    if (!this.hasUser(userId)) {
      const newUser: IUserLevel = {
        userId: userId,
        currentLevel: 0,
        messageCount: 0,
        timeOfLastMessage: 0,
        totalExp: 0,
      };
      this.db.set(userId, newUser);
      return newUser;
    }
    return this.getUser(userId)!;
  }

  public updateUser(userId: string, newUserLevel: IUserLevel): void {
    this.db.set(userId, newUserLevel);
  }

  public resetUser(userId: string): void {
    this.db.delete(userId);
  }

  public getAllUsers(): Array<IUserLevel> {
    return this.getAllValues();
  }

  public getAllUsersSortedByExp(): Array<IUserLevel> {
    const users = this.getAllUsers();
    users.sort((a, b) => b.totalExp - a.totalExp);
    return users;
  }
}
