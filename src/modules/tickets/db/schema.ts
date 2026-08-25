import { createModuleTable } from "@common/db/schema-types";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tickets = createModuleTable("tickets__tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  encryptedUserId: text("encrypted_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ticketButtonMessages = createModuleTable("tickets__button_messages", {
  type: text("type").primaryKey(),
  channelId: text("channel_id").notNull(),
  messageId: text("message_id").notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;

export default {
  tickets,
  ticketButtonMessages,
};
