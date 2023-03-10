import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const exerciseRouter = createTRPCRouter({
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.exercise.findMany({});
    const categories = exercises.map(exercise => exercise.category);
    return [...new Set(categories)];
  }),

  getExercises: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.exercise.findMany();
  }),

  createExercise: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        hasReps: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exercise.create({
        data: {
          name: input.name,
          category: input.category,
          hasReps: input.hasReps,
        },
      });
    }),

  updateExercise: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
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
          category: input.category,
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
