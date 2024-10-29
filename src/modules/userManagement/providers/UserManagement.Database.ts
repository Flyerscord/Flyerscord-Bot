import Stumper from "stumper";
import Database from "../../../common/providers/Database.js";
import { IUserEvent } from "../interfaces/IUserEvent.js";
import { IUserInfo } from "../interfaces/IUserInfo.js";

export default class UserManagementDB extends Database {
  private static instance: UserManagementDB;

  private constructor() {
    super({ name: "user-management" });
  }

  static getInstance(): UserManagementDB {
    return this.instance || (this.instance = new this());
  }

  getUser(userId: string): IUserInfo {
    if (!this.hasUser(userId)) {
      this.addUser(userId);
    }
    return this.db.get(userId);
  }

  addWarning(userId: string, reason: string): void {
    const warningEvent: IUserEvent = { date: Date.now(), reason: reason };
    this.db.push(userId, warningEvent, "warnings");
    Stumper.info(`Warning added for user: ${userId} with the reason: ${reason}`, "UserManagementDB:addWarning");
  }

  addNote(userId: string, reason: string): void {
    const noteEvent: IUserEvent = { date: Date.now(), reason: reason };
    this.db.push(userId, noteEvent, "notes");
    Stumper.info(`Note added for user: ${userId} with the reason: ${reason}`, "UserManagementDB:addNote");
  }

  private hasUser(userId: string): boolean {
    return this.db.has(userId);
  }

  private addUser(userId: string): void {
    const userInfo: IUserInfo = { userId: userId, notes: [], warnings: [] };
    this.db.set(userId, userInfo);
  }
}
