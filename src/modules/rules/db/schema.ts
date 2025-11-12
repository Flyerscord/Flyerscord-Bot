import { createModuleEnum, createModuleTable } from "@root/src/common/db/schema-types";
import { check, integer, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";

export enum RulesSectionTypeEnum {
  HEADER = "HEADER",
  CONTENT = "CONTENT",
}
const rulesSectionType = createModuleEnum("rules__section_type", RulesSectionTypeEnum);

export const rulesMessages = createModuleTable("rules__messages", {
  messageId: varchar("message_id", { length: 255 }).primaryKey(),
  index: integer("index").notNull(),
});

export const rulesSections = createModuleTable("rules__sections", {
  name: varchar("name", { length: 255 }).primaryKey(),
  friendlyName: varchar("friendly_name", { length: 255 }).notNull(),
  content: text("content").notNull(),
});

export const rulesSectionMessages = createModuleTable(
  "rules__section_messages",
  {
    messageId: varchar("message_id", { length: 255 })
      .primaryKey()
      .references(() => rulesMessages.messageId),
    sectionId: varchar("section_id", { length: 255 })
      .notNull()
      .references(() => rulesSections.name),
    type: rulesSectionType("type").notNull(),
    url: varchar("url", { length: 255 }),
    content: text("content"),
  },
  (table) => [
    check(
      "type_constraint",
      sql`
      (${table.type} = 'HEADER' AND ${table.url} IS NOT NULL AND ${table.content} IS NULL) OR
      (${table.type} = 'CONTENT' AND ${table.content} IS NOT NULL AND ${table.url} IS NULL)
    `,
    ),
  ],
);

export const rulesState = createModuleTable("rules__state", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export default {
  rulesSections,
  rulesMessages,
  rulesSectionMessages,
  rulesState,
};
