import { z } from "zod";
import { reduceByCategory } from "../../../utils";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const exerciseRouter = createTRPCRouter({
  getGroups: adminProcedure.query(async ({ ctx }) => {
    const exercises = await ctx.prisma.exercise.findMany();
    return exercises.reduce(reduceByCategory, []);
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
