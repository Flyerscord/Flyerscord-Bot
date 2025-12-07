import { createModuleTable } from "@root/src/common/db/schema-types";
import { boolean, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const daysUntilDates = createModuleTable("daysuntil__dates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  date: timestamp("date"),
  enabled: boolean("enabled").notNull().default(false),
});

export default {
  daysUntilDates,
};

export type DaysUntilDate = Omit<typeof daysUntilDates.$inferSelect, "id">;
