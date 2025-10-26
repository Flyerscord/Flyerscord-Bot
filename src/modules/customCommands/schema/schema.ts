import { createModuleTable } from "@root/src/common/db/schema-types";
import { serial, integer, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const customCommandsCommands = createModuleTable("custom_commands__commands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  text: text("text").notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdOn: timestamp("created_on").notNull().defaultNow(),
});

export const customCommandsHistory = createModuleTable("custom_commands__history", {
  id: serial("id").primaryKey(),
  commandId: integer("command_id")
    .references(() => customCommandsCommands.id)
    .notNull(),
  oldText: text("old_text").notNull(),
  newText: text("new_text").notNull(),
  editedBy: varchar("edited_by", { length: 255 }).notNull(),
  editedOn: timestamp("edited_on").notNull().defaultNow(),
});

export default {
  customCommandsCommands,
  customCommandsHistory,
};
