import { Method } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { ParseJsonValues } from "../../../utils/types";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

export const exerciseInWorkoutRouter = createTRPCRouter({
  getMany: userProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input: { workoutId } }) => {
      const workout = await ctx.prisma.workout.findUniqueOrThrow({
        where: { id: workoutId },
        include: { profile: { include: { user: { select: { id: true } } } } },
      });

      if (workout.profile.user?.id !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const exercises = await ctx.prisma.exerciseInWorkout.findMany({ where: { workoutId } });

      return exercises as ParseJsonValues<typeof exercises>;
    }),

  create: adminProcedure
    .input(
      z.object({
        workoutId: z.string(),
        exerciseId: z.string(),
        sets: z
          .array(z.object({ reps: z.number(), weight: z.number() }))
          .or(z.array(z.object({ time: z.number(), weight: z.number() }))),
        description: z.string().nullish(),
        method: z.nativeEnum(Method),
        index: z.number(),
      }),
    )
    .mutation(({ ctx, input: { workoutId, exerciseId, sets, description, method, index } }) => {
      return ctx.prisma.exerciseInWorkout.create({
        data: {
          workout: { connect: { id: workoutId } },
          exercise: { connect: { id: exerciseId } },
          sets,
          description,
          method,
          index,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        sets: z
          .array(z.object({ reps: z.number(), weight: z.number() }))
          .or(z.array(z.object({ time: z.number(), weight: z.number() }))),
        description: z.string().nullish(),
        method: z.nativeEnum(Method),
      }),
    )
    .mutation(({ ctx, input: { id, sets, description, method } }) => {
      return ctx.prisma.exerciseInWorkout.update({
        where: { id },
        data: { sets, description, method },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input: { id } }) => ctx.prisma.exerciseInWorkout.delete({ where: { id } })),
});
