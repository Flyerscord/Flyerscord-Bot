import { z } from "zod";
import { publicProcedure, authedProcedure, router } from "../trpc";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    const user = ctx.req.session.webUser;
    if (!user) return null;
    return {
      userId: user.discordUserId,
      isAdmin: user.isAdmin,
    };
  }),

  logout: authedProcedure.mutation(({ ctx }) => {
    return new Promise<void>((resolve, reject) => {
      ctx.req.session.destroy((err: unknown) => (err ? reject(err) : resolve()));
    });
  }),
});
