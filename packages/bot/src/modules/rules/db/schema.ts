import { createModuleEnum, createModuleTable } from "@common/db/schema-types";
import { check, integer, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";

export enum RulesSectionTypeEnum {
  HEADER = "HEADER",
  CONTENT = "CONTENT",
}
export const rulesSectionType = createModuleEnum("rules__section_type", RulesSectionTypeEnum);

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
      sql`(${table.type} = 'HEADER'::rules__section_type AND ${table.url} IS NOT NULL AND ${table.content} IS NULL) OR (${table.type} = 'CONTENT'::rules__section_type AND ${table.content} IS NOT NULL AND ${table.url} IS NULL)`,
    ),
  ],
);

export const rulesState = createModuleTable("rules__state", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export default {
  rulesSectionType,
  rulesSections,
  rulesMessages,
  rulesSectionMessages,
  rulesState,
};

// Database row types (inferred from schema)
export type RulesSection = typeof rulesSections.$inferSelect;
export type RulesMessage = typeof rulesMessages.$inferSelect;
export type RulesSectionMessage = typeof rulesSectionMessages.$inferSelect;
export type RulesStateEntry = typeof rulesState.$inferSelect;

// DTO types - maintain compatibility with IRuleSection interface
// Why: Commands expect contentPages as an array, but DB stores content concatenated
// The RulesDB class transforms between these representations
export interface RuleSectionDTO {
  name: string;
  friendlyName: string;
  headerUrl: string;
  headerMessageId: string | null;
  contentPages: RuleContentPageDTO[];
}

export interface RuleContentPageDTO {
  messageId: string;
  content: string;
}
