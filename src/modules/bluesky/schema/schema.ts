import { createModuleEnum, createModuleTable } from "@root/src/common/db/schema-types";
import { varchar, text, timestamp, serial } from "drizzle-orm/pg-core";

export const actionTypeEnum = createModuleEnum("bluesky__action_type", ["ADD", "REMOVE"]);

export const blueSkyState = createModuleTable("bluesky__state", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blueSkyAccountHistory = createModuleTable("bluesky__account_history", {
  id: serial("id").primaryKey(),
  account: varchar("account", { length: 255 }).notNull(),
  actionType: actionTypeEnum("action_type").notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export default {
  blueSkyState,
  blueSkyAccountHistory,
};
