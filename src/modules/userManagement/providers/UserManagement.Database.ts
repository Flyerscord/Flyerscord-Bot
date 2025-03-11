import Stumper from "stumper";
import Database from "../../../common/providers/Database";
import { IUserEvent } from "../interfaces/IUserEvent";
import { IUserInfo } from "../interfaces/IUserInfo";

export default class UserManagementDB extends Database {
  constructor() {
    super({ name: "user-management" });
  }

  getUser(userId: string): IUserInfo {
    if (!this.hasUser(userId)) {
      this.addUser(userId);
    }
    return this.db.get(userId);
  }

  addWarning(userId: string, reason: string, addedBy: string): void {
    if (!this.hasUser(userId)) {
      this.addUser(userId);
    }
    const warningEvent: IUserEvent = { date: Date.now(), reason: reason, addedBy: addedBy };
    this.db.push(userId, warningEvent, "warnings");
    Stumper.info(`Warning added for user: ${userId} with the reason: ${reason}`, "userManagement:UserManagementDB:addWarning");
  }

  addNote(userId: string, reason: string, addedBy: string): void {
    if (!this.hasUser(userId)) {
      this.addUser(userId);
    }
    const noteEvent: IUserEvent = { date: Date.now(), reason: reason, addedBy: addedBy };
    this.db.push(userId, noteEvent, "notes");
    Stumper.info(`Note added for user: ${userId} with the reason: ${reason}`, "userManagement:UserManagementDB:addNote");
  }

  private hasUser(userId: string): boolean {
    return this.db.has(userId);
  }

  private addUser(userId: string): void {
    const userInfo: IUserInfo = { userId: userId, notes: [], warnings: [] };
    this.db.set(userId, userInfo);
  }
}
