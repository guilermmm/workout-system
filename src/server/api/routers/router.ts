import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }))
    .query(({ ctx, input }) => {
      return `Hello ${input.text}`;
    }),

  getSecretMessage: protectedProcedure.query(({ ctx }) => {
    return `Secret message for ${ctx.session.user.email}`;
  }),

  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        email: ctx.session.user.email ?? undefined,
      },
    });
  }),

  createExercise: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        muscleGroup: z.string(),
        hasSets: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exercise.create({
        data: {
          name: input.name,
          muscleGroup: input.muscleGroup,
          hasSets: input.hasSets,
        },
      });
    }),

  updateExercise: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        muscleGroup: z.string(),
        hasSets: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exercise.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          muscleGroup: input.muscleGroup,
          hasSets: input.hasSets,
        },
      });
    }),

  deleteExercise: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exercise.delete({
        where: {
          id: input.id,
        },
      });
    }),

  createWorkout: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        exercises: z.array(
          z.object({
            exerciseId: z.string(),
            sets: z.number(),
            reps: z.number(),
            weight: z.number().optional(),
            time: z.number(),
            description: z.string().optional(),
          })
        ),
        userId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.create({
        data: {
          name: input.name,
          exercises: {
            create: input.exercises.map((exercise) => ({
              exercise: { connect: { id: exercise.exerciseId } },
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              time: exercise.time,
              description: exercise.description,
            })),
          },
          user: { connect: { id: input.userId } },
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
            exerciseId: z.string(),
            sets: z.number(),
            reps: z.number(),
            weight: z.number().optional(),
            time: z.number(),
            description: z.string().optional(),
          })
        ),
        userId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          exercises: {
            create: input.exercises.map((exercise) => ({
              exercise: { connect: { id: exercise.exerciseId } },
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              time: exercise.time,
              description: exercise.description,
            })),
          },
          user: { connect: { id: input.userId } },
        },
      });
    }),

  deleteWorkout: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
