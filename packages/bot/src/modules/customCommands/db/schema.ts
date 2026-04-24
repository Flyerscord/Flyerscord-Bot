import { createModuleTable } from "@common/db/schema-types";
import { sql } from "drizzle-orm";
import { serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const customCommandsCommands = createModuleTable("customcommands__commands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  text: text("text").notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdOn: timestamp("created_on").notNull().defaultNow(),
});

export const customCommandsState = createModuleTable("customcommands__state", {
  key: varchar("key", { length: 255 }).primaryKey(),
  messageIds: text("message_ids")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export default {
  customCommandsCommands,
  customCommandsState,
};

export type CustomCommand = typeof customCommandsCommands.$inferSelect;
