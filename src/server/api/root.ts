import { createTRPCRouter } from "./trpc";
import { appRouter as app } from "./routers/appRouter";
import { workoutRouter } from "./routers/workoutRouter";
import { exerciseRouter } from "./routers/exerciseRouter";
import { exerciseInWorkoutRouter } from "./routers/exerciseInWorkoutRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  app,
  workoutRouter,
  exerciseRouter,
  exerciseInWorkoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
