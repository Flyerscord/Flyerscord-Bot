import { createModuleTable } from "@root/src/common/db/schema-types";
import { varchar, text, timestamp } from "drizzle-orm/pg-core";

export const blueSkyState = createModuleTable("bluesky__state", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export default {
  blueSkyState,
};
