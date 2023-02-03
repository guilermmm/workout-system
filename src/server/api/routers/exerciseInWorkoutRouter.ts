import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const exerciseInWorkoutRouter = createTRPCRouter({
  createExerciseInWorkout: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
        exerciseId: z.string(),
        sets: z.number(),
        reps: z.number(),
        weight: z.number(),
        time: z.number(),
        description: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exerciseInWorkout.create({
        data: {
          workout: {
            connect: {
              id: input.workoutId,
            },
          },
          exercise: {
            connect: {
              id: input.exerciseId,
            },
          },
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
          time: input.time,
          description: input.description,
        },
      });
    }),

  updateExerciseInWorkout: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        sets: z.number(),
        reps: z.number(),
        weight: z.number(),
        time: z.number(),
        description: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exerciseInWorkout.update({
        where: {
          id: input.id,
        },
        data: {
          sets: input.sets,
          reps: input.reps,
          weight: input.weight,
          time: input.time,
          description: input.description,
        },
      });
    }),

  deleteExerciseInWorkout: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exerciseInWorkout.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getExercisesInWorkout: protectedProcedure
    .input(
      z.object({
        workoutId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.exerciseInWorkout.findMany({
        where: {
          workoutId: input.workoutId,
        },
      });
    }),
});
