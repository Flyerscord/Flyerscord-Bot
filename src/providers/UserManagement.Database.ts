import Stumper from "stumper";
import { IUserInfo, IUserEvent } from "../interfaces/UserManagement";
import Database from "./Database";

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

  addMute(userId: string, reason: string): void {
    const mutingEvent: IUserEvent = { date: Date.now(), reason: reason };
    this.db.push(userId, mutingEvent, "mutes");
    Stumper.info(`Mute added for user: ${userId} with the reason: ${reason}`, "UserManagementDB:addMute");
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
    const userInfo: IUserInfo = { userId: userId, mutes: [], notes: [], warnings: [] };
    this.db.set(userId, userInfo);
  }
}
