import { createModuleTable } from "@common/db/schema-types";
import { boolean, index, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const daysUntilDates = createModuleTable(
  "daysuntil__dates",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    date: timestamp("date"),
    enabled: boolean("enabled").notNull().default(false),
  },
  (table) => [index("daysuntil_enabled_idx").on(table.enabled)],
);

export default {
  daysUntilDates,
};

export type DaysUntilDate = Omit<typeof daysUntilDates.$inferSelect, "id">;
