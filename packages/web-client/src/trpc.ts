import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@flyerscord/web-server/src/router";

export const trpc = createTRPCReact<AppRouter>();
