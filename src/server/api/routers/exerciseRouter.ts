import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const exerciseRouter = createTRPCRouter({
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
});
