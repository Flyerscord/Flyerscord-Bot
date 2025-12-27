import { createModuleTable } from "@root/src/common/db/schema-types";
import { varchar } from "drizzle-orm/pg-core";

export const reactionRoleMessages = createModuleTable("reactionrole__messages", {
  name: varchar("name", { length: 255 }).primaryKey(),
  messageId: varchar("message_id", { length: 255 }).notNull(),
});

export default {
  reactionRoleMessages,
};
