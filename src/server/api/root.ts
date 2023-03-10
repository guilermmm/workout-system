import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/userRouter";
import { workoutRouter } from "./routers/workoutRouter";
import { exerciseRouter } from "./routers/exerciseRouter";
import { exerciseInWorkoutRouter } from "./routers/exerciseInWorkoutRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const router = createTRPCRouter({
  user: userRouter,
  workout: workoutRouter,
  exercise: exerciseRouter,
  exerciseinWorkout: exerciseInWorkoutRouter,
});

// export type definition of API
export type AppRouter = typeof router;
