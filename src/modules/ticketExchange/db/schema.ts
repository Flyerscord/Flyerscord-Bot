import { createModuleEnum, createModuleTable, createStateTable } from "@common/db/schema-types";
import { jsonb, timestamp } from "drizzle-orm/pg-core";
import { text, primaryKey } from "drizzle-orm/pg-core";

export const ticketExchangeState = createStateTable("ticketexchange", ["string"]);

export enum PrivateThreadType {
  POST = "POST",
  STH = "STH",
}

export const privateThreadTypeEnum = createModuleEnum("ticketexchange__private_thread_type", PrivateThreadType);

export const privateThreads = createModuleTable(
  "ticketexchange__private_threads",
  {
    userId: text("user_id").notNull(),
    type: privateThreadTypeEnum("type").notNull(),
    privateThreadId: text("private_thread_id").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.type],
    }),
  ],
);

export const modalFields = createModuleTable(
  "ticketexchange__modal_fields",
  {
    userId: text("user_id").notNull(),
    modalId: text("modal_id").notNull(),
    fields: jsonb("fields").notNull(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.modalId],
    }),
  ],
);

export default {
  ticketExchangeState,
  privateThreadTypeEnum,
  privateThreads,
  modalFields,
};

export type TicketExchangeState = typeof ticketExchangeState.$inferSelect;
export type NewTicketExchangeState = typeof ticketExchangeState.$inferInsert;

export type PrivateThread = typeof privateThreads.$inferSelect;
export type NewPrivateThread = typeof privateThreads.$inferInsert;

export type ModalFields = typeof modalFields.$inferSelect;
export type NewModalFields = typeof modalFields.$inferInsert;
