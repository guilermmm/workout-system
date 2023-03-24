import { Method } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

export const exerciseInWorkoutRouter = createTRPCRouter({
  createExerciseInWorkout: adminProcedure
    .input(
      z.object({
        workoutId: z.string(),
        exerciseId: z.string(),
        sets: z
          .array(z.object({ reps: z.number(), weight: z.number() }))
          .or(z.array(z.object({ time: z.number(), weight: z.number() }))),
        description: z.string().nullish(),
        method: z.nativeEnum(Method),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exerciseInWorkout.create({
        data: {
          workout: { connect: { id: input.workoutId } },
          exercise: { connect: { id: input.exerciseId } },
          sets: input.sets,
          description: input.description,
          method: input.method,
        },
      });
    }),

  updateExerciseInWorkout: adminProcedure
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
    .mutation(({ ctx, input }) => {
      return ctx.prisma.exerciseInWorkout.update({
        where: { id: input.id },
        data: { sets: input.sets, description: input.description, method: input.method },
      });
    }),

  deleteExerciseInWorkout: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.prisma.exerciseInWorkout.delete({ where: { id: input.id } })),

  getExercisesInWorkout: adminProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.exerciseInWorkout.findMany({ where: { workoutId: input.workoutId } });
    }),

  getExercisesInWorkoutBySession: userProcedure
    .input(z.object({ workoutId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workout = await ctx.prisma.workout.findUniqueOrThrow({
        where: { id: input.workoutId },
        include: { profile: { include: { user: { select: { id: true } } } } },
      });

      if (workout.profile.user?.id !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return await ctx.prisma.exerciseInWorkout.findMany({ where: { workoutId: input.workoutId } });
    }),
});
