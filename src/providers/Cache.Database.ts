import _ from "lodash";

import Database from "./Database";
import { IDaysUtilCache } from "../interfaces/Cache";

export default class CacheDB extends Database {
  private static instance: CacheDB;

  private readonly CURRENT_PLAYER_EMOJIS_KEY = "currentPlayerEmojis";
  private readonly DAYS_UNTIL_DATES_KEY = "daysUntilDates";
  private readonly VISITOR_ROLE_MESSAGE_ID_KEY = "visitorRoleMessageId";

  private constructor() {
    super({ name: "Cache" });
    this.db.ensure(this.CURRENT_PLAYER_EMOJIS_KEY, []);
    this.db.ensure(this.DAYS_UNTIL_DATES_KEY, []);
    this.db.ensure(this.VISITOR_ROLE_MESSAGE_ID_KEY, "");
  }

  static getInstance(): CacheDB {
    return this.instance || (this.instance = new this());
  }

  /* -------------------------------------------------------------------------- */
  /*                            Current Player Emojis                           */
  /* -------------------------------------------------------------------------- */
  clearCurrentPlayerEmojis(): void {
    this.db.set(this.CURRENT_PLAYER_EMOJIS_KEY, []);
  }

  addCurrentPlayerEmoji(emojiName: string): void {
    this.db.push(this.CURRENT_PLAYER_EMOJIS_KEY, emojiName);
  }

  /* -------------------------------------------------------------------------- */
  /*                               Days Until Date                              */
  /* -------------------------------------------------------------------------- */

  addDaysUntilDate(date: IDaysUtilCache): void {
    this.db.push(this.DAYS_UNTIL_DATES_KEY, date);
  }

  removeDaysUntilDate(name: string): void {
    const daysUtilArray: Array<IDaysUtilCache> = this.db.get(this.DAYS_UNTIL_DATES_KEY);
    _.remove(daysUtilArray, (val) => val.name == name);
  }

  /* -------------------------------------------------------------------------- */
  /*                           Visitor Role Message ID                          */
  /* -------------------------------------------------------------------------- */

  getVisitorRoleMessageId(): string {
    return this.db.get(this.VISITOR_ROLE_MESSAGE_ID_KEY);
  }

  setVisitorRoleMessageId(newMessageId: string): void {
    this.db.set(this.VISITOR_ROLE_MESSAGE_ID_KEY, newMessageId);
  }
}
