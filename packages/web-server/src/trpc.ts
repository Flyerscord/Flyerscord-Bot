import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { isAdminCacheStale, isUserAdmin } from "./utils/adminCheck";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.req.session.webUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.req.session.webUser } });
});

export const adminProcedure = authedProcedure.use(async ({ ctx, next }) => {
  const user = ctx.req.session.webUser!;

  if (isAdminCacheStale(user.isAdminVerifiedAt)) {
    const admin = await isUserAdmin(user.discordUserId);
    ctx.req.session.webUser = { ...user, isAdmin: admin, isAdminVerifiedAt: Date.now() };
    await new Promise<void>((resolve, reject) => ctx.req.session.save((err: unknown) => (err ? reject(err) : resolve())));
  }

  if (!ctx.req.session.webUser!.isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});
