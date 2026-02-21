import { createModuleTable } from "@common/db/schema-types";
import { text, timestamp } from "drizzle-orm/pg-core";

export const claimRoleAllowlist = createModuleTable("claimrole__allowlist", {
  discordUserId: text("discord_user_id").primaryKey(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export default {
  claimRoleAllowlist,
};
