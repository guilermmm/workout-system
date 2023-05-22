import { datasheetRouter } from "./routers/datasheetRouter";
import { exerciseRouter } from "./routers/exerciseRouter";
import { finishedWorkoutRouter } from "./routers/finishedWorkoutRouter";
import { userRouter } from "./routers/userRouter";
import { workoutRouter } from "./routers/workoutRouter";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const router = createTRPCRouter({
  user: userRouter,
  workout: workoutRouter,
  exercise: exerciseRouter,
  datasheet: datasheetRouter,
  finishedWorkout: finishedWorkoutRouter,
});

// export type definition of API
export type AppRouter = typeof router;
