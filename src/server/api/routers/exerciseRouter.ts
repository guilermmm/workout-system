import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const exerciseRouter = createTRPCRouter({
  getExercises: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.exercise.findMany();
  }),

  createExercise: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        muscleGroup: z.string(),
        hasReps: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exercise.create({
        data: {
          name: input.name,
          muscleGroup: input.muscleGroup,
          hasReps: input.hasReps,
        },
      });
    }),

  updateExercise: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        muscleGroup: z.string(),
        hasReps: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exercise.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          muscleGroup: input.muscleGroup,
          hasReps: input.hasReps,
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
});
