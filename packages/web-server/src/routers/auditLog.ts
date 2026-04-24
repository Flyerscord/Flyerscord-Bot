import { desc, eq, count } from "drizzle-orm";
import { z } from "zod";
import { adminProcedure, router } from "../trpc";
import { db } from "../db";
import { auditLogEntries } from "../db/schema";

const PAGE_SIZE = 50;

export const auditLogRouter = router({
  list: adminProcedure
    .input(
      z.object({
        module: z.string().optional(),
        page: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * PAGE_SIZE;
      const where = input.module ? eq(auditLogEntries.moduleName, input.module) : undefined;

      const [entries, totalResult] = await Promise.all([
        db.select().from(auditLogEntries).where(where).orderBy(desc(auditLogEntries.timestamp)).limit(PAGE_SIZE).offset(offset),
        db.select({ count: count() }).from(auditLogEntries).where(where),
      ]);

      return {
        entries,
        total: totalResult[0].count,
        page: input.page,
        pageSize: PAGE_SIZE,
      };
    }),
});
