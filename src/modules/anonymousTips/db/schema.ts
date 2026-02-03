import { createModuleTable } from "@common/db/schema-types";
import { serial, text, timestamp } from "drizzle-orm/pg-core";

export const tips = createModuleTable("anonymoustips__tips", {
  id: serial("id").primaryKey(),
  encryptedUserId: text("encrypted_user_id").notNull(),
  tip: text("tip").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tipBans = createModuleTable("anonymoustips__tip_bans", {
  encryptedUserId: text("encrypted_user_id")
    .notNull()
    .unique()
    .references(() => tips.encryptedUserId),
  bannedAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  bannedBy: text("banned_by").notNull(),
  bannedTip: serial("banned_tip")
    .notNull()
    .references(() => tips.id),
});

export const state = createModuleTable("anonymoustips__state", {
  key: text("key").primaryKey(),
  stringValue: text("string_value").notNull(),
});

export default {
  tips,
  tipBans,
  state,
};

export type Tip = typeof tips.$inferSelect;
export type NewTip = typeof tips.$inferInsert;

export type TipBan = typeof tipBans.$inferSelect;
export type NewTipBan = typeof tipBans.$inferInsert;

export type State = typeof state.$inferSelect;
export type NewState = typeof state.$inferInsert;
