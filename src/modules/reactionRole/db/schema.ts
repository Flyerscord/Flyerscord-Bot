import { createModuleTable } from "@common/db/schema-types";
import { index, varchar } from "drizzle-orm/pg-core";

export const reactionRoleMessages = createModuleTable(
  "reactionrole__messages",
  {
    name: varchar("name", { length: 255 }).primaryKey(),
    messageId: varchar("message_id", { length: 255 }).notNull(),
  },
  (table) => [index("reactionrole_message_id_idx").on(table.messageId)],
);

export default {
  reactionRoleMessages,
};
