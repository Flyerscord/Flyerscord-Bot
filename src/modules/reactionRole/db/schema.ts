import { createModuleTable } from "@root/src/common/db/schema-types";
import { serial, varchar } from "drizzle-orm/pg-core";

export const reactionRoleMessages = createModuleTable("reactionrole__messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  messageId: varchar("message_id", { length: 255 }).notNull(),
});

export default {
  reactionRoleMessages,
};
