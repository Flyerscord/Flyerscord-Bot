import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { events } from "../models/DaysUntilEvents";
import { DaysUntilDate, daysUntilDates } from "./schema";
import { eq } from "drizzle-orm";

export default class DaysUntilDB extends ModuleDatabase {
  constructor() {
    super("DaysUntil");

    for (const key of Object.keys(events)) {
      const event = events[key];
      const defaultEvent: DaysUntilDate = {
        enabled: false,
        date: null,
        name: event.name,
      };

      this.db.insert(daysUntilDates).values(defaultEvent).onConflictDoNothing();
    }
  }

  async getEvent(name: string): Promise<DaysUntilDate> {
    return (await this.db.select().from(daysUntilDates).where(eq(daysUntilDates.name, name)))[0];
  }

  async setEventEnabled(name: string, enabled: boolean): Promise<void> {
    await this.db.update(daysUntilDates).set({ enabled: enabled }).where(eq(daysUntilDates.name, name));
  }

  async setEventDate(name: string, date: Date): Promise<void> {
    await this.db.update(daysUntilDates).set({ date: date, enabled: true }).where(eq(daysUntilDates.name, name));
  }

  async getEnabledEventNames(): Promise<string[]> {
    return (await this.db.select({ name: daysUntilDates.name }).from(daysUntilDates).where(eq(daysUntilDates.enabled, true))).map((row) => row.name);
  }
}
