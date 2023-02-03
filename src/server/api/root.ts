import { createTRPCRouter } from "./trpc";
import { appRouter as app } from "./routers/router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  app,
});

// export type definition of API
export type AppRouter = typeof appRouter;
