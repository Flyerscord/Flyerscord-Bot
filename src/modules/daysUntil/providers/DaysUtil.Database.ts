import Database from "../../../common/providers/Database";
import IDbEvent from "../interfaces/IDbEvent";
import { events } from "../models/DaysUntilEvents";

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

  getEnabledEventNames(): string[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enabledEvents: { key: string | number; value: any }[] = this.getAllKeysAndValues().filter((keyValue) => keyValue.value.enabled);

    return enabledEvents.map((keyValue) => keyValue.key as string);
  }
}
