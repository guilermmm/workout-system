import type { Exercise } from "@prisma/client";
import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const exerciseRouter = createTRPCRouter({
  getCategories: adminProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.exercise.findMany({});
    const categories = exercises.reduce((acc, exercise) => {
      const existingCategory = acc.find(item => item.category === exercise.category);

      if (existingCategory) {
        existingCategory.exercises.push(exercise);
      } else {
        acc.push({ category: exercise.category, exercises: [exercise] });
      }

      return acc;
    }, [] as { category: string; exercises: Exercise[] }[]);
    return categories;
  }),

  getExercises: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.exercise.findMany();
  }),

  createExercise: adminProcedure
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

  updateExercise: adminProcedure
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

  deleteExercise: adminProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.exercise.delete({
      where: {
        id: input.id,
      },
    });
  }),
});
