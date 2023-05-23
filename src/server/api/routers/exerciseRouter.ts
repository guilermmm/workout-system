import type { Exercise } from "@prisma/client";
import { z } from "zod";
import { adminProcedure, baseProcedure, createTRPCRouter } from "../trpc";

export const exerciseRouter = createTRPCRouter({
  getGroups: adminProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.exercise.findMany({
      select: {
        id: true,
        category: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        image: false,
      },
    });
    return exercises
      .reduce((acc, exercise) => {
        const existingCategory = acc.find(item => item.category === exercise.category);

        if (existingCategory) {
          existingCategory.exercises.push(exercise);
        } else {
          acc.push({ category: exercise.category, exercises: [exercise] });
        }

        return acc;
      }, [] as { category: string; exercises: Omit<Exercise, "image">[] }[])
      .map(({ category, exercises }) => ({
        category,
        exercises: exercises.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }),

  getExerciseImageById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input: { id } }) => {
      const exercise = await ctx.prisma.exercise.findUniqueOrThrow({ where: { id } });
      return exercise.image;
    }),

  create: baseProcedure
    .input(z.object({ name: z.string(), category: z.string(), image: z.string().optional() }))
    .mutation(async ({ ctx, input: { name, category, image } }) => {
      await ctx.prisma.exercise.create({ data: { name, category, image } });
    }),

  update: baseProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        category: z.string(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { id, name, category, image } }) => {
      await ctx.prisma.exercise.update({ where: { id }, data: { name, category, image } });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      await ctx.prisma.exercise.delete({ where: { id } });
    }),
});
