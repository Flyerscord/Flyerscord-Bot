import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { leaderboardRouter } from "./routers/leaderboard";
import { auditLogRouter } from "./routers/auditLog";

export const appRouter = router({
  auth: authRouter,
  leaderboard: leaderboardRouter,
  auditLog: auditLogRouter,
});

export type AppRouter = typeof appRouter;
