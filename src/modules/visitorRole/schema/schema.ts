import { createModuleTable } from "@root/src/common/db/schema-types";
import { timestamp, varchar } from "drizzle-orm/pg-core";

export const visitorRoleState = createModuleTable("visitor_role__state", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: varchar("value", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export default {
  visitorRoleState,
};
