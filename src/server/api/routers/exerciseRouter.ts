import type { Exercise } from "@prisma/client";
import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const exerciseRouter = createTRPCRouter({
  getGroups: adminProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.exercise.findMany();
    return exercises
      .reduce((acc, exercise) => {
        const existingCategory = acc.find(item => item.category === exercise.category);

        if (existingCategory) {
          existingCategory.exercises.push(exercise);
        } else {
          acc.push({ category: exercise.category, exercises: [exercise] });
        }

        return acc;
      }, [] as { category: string; exercises: Exercise[] }[])
      .map(({ category, exercises }) => ({
        category,
        exercises: exercises.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }),

  getCategories: adminProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.exercise.findMany({ select: { category: true } });
    return [...new Set(exercises.map(it => it.category))];
  }),

  getMany: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.exercise.findMany();
  }),

  create: adminProcedure
    .input(z.object({ name: z.string(), category: z.string() }))
    .mutation(({ ctx, input: { name, category } }) => {
      return ctx.prisma.exercise.create({ data: { name, category } });
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string(), category: z.string() }))
    .mutation(({ ctx, input: { id, name, category } }) => {
      return ctx.prisma.exercise.update({ where: { id }, data: { name, category } });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input: { id } }) => ctx.prisma.exercise.delete({ where: { id } })),
});
