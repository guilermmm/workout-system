import type { Workout } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workoutRouter = createTRPCRouter({
  createWorkout: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        profileId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.create({
        data: {
          name: input.name,
          profile: { connect: { id: input.profileId } },
        },
      });
    }),

  updateWorkout: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        exercises: z.array(
          z.object({
            id: z.string(),
            exerciseId: z.string(),
            sets: z.number(),
            reps: z.number(),
            weight: z.number().nullish(),
            time: z.number(),
            description: z.string().nullish(),
          }),
        ),
        delete: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workout.update({
        where: { id: input.id },
        data: {
          name: input.name,
          exercises: {
            connectOrCreate: input.exercises
              .filter(exercise => exercise.id === "")
              .map(exercise => ({
                where: { id: exercise.id },
                create: {
                  sets: exercise.sets,
                  reps: exercise.reps,
                  weight: exercise.weight,
                  time: exercise.time,
                  description: exercise.description,
                  exercise: { connect: { id: exercise.exerciseId } },
                },
              })),
            updateMany: input.exercises
              .filter(exercise => exercise.id !== "")
              .map(exercise => ({
                where: { id: exercise.id },
                data: {
                  sets: exercise.sets,
                  reps: exercise.reps,
                  weight: exercise.weight,
                  time: exercise.time,
                  description: exercise.description,
                },
              })),
            deleteMany: input.delete.map(id => ({ id })),
          },
        },
      });
    }),

  changeWorkoutName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.workout.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      });
    }),

  deleteWorkout: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.delete({ where: { id: input.id } });
    }),

  getWorkouts: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      return (
        await ctx.prisma.workout.findMany({
          where: { profileId: input.profileId },
          include: { exercises: { include: { exercise: { select: { category: true } } } } },
        })
      ).map(workout => {
        return {
          id: workout.id,
          name: workout.name,
          createdAt: workout.createdAt,
          updatedAt: workout.updatedAt,
          profileId: workout.profileId,
          categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
        };
      });
    }),

  getWorkout: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.workout.findUnique({
      where: { id: input.id },
      include: {
        exercises: { include: { exercise: true } },
        profile: { include: { user: true } },
      },
    });
  }),

  recommendNext: protectedProcedure
    .input(z.object({ profileId: z.string(), lastWorkoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workouts = await ctx.prisma.workout.findMany({
        where: { profileId: input.profileId },
      });

      workouts.sort((a, b) => {
        // sort by alphabetical order
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });

      const lastWorkoutIndex = workouts.findIndex(workout => workout.id === input.lastWorkoutId);

      const nextWorkout = workouts[lastWorkoutIndex + 1] ?? (workouts[0] as Workout);

      return ctx.prisma.profile.update({
        where: { id: input.profileId },
        data: { nextWorkoutId: nextWorkout.id },
      });
    }),
});
