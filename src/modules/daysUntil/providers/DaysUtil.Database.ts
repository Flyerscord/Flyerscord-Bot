import Database from "../../../common/providers/Database.js";
import IDbEvent from "../interfaces/IDbEvent.js";
import events from "../models/DaysUntilEvents.js";

export default class DaysUntilDB extends Database {
  private static instance: DaysUntilDB;

  private constructor() {
    super({ name: "days-until" });

    const defaultEvent: IDbEvent = {
      enabled: false,
      date: -1,
    };

    for (const key of Object.keys(events)) {
      const event = events[key];
      this.db.ensure(event.dbKey, defaultEvent);
    }
  }

  static getInstance(): DaysUntilDB {
    return this.instance || (this.instance = new this());
  }

  getEvent(dbKey: string): IDbEvent {
    return this.db.get(dbKey);
  }

  setEventEnabled(dbKey: string, enabled: boolean): void {
    this.db.set(dbKey, { enabled: enabled });
  }

  setEventDate(dbKey: string, date: number): void {
    this.db.set(dbKey, { date: date, enabled: true });
  }
}
