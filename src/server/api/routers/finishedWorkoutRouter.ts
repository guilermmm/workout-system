import { Method } from "@prisma/client";
import { z } from "zod";
import type { ParseFinishedWorkout } from "../../../utils/types";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

const exerciseParser = z.object({
  exercise: z.object({
    name: z.string().min(1),
    category: z.string().min(1),
  }),
  description: z.string().nullable(),
  method: z.nativeEnum(Method),
  sets: z.union([
    z.array(z.object({ reps: z.number().min(0), weight: z.number().min(0) })).min(1),
    z.array(z.object({ time: z.number().min(0), weight: z.number().min(0) })).min(1),
  ]),
});

export const finishedWorkoutRouter = createTRPCRouter({
  create: userProcedure
    .input(
      z.object({
        name: z.string().min(1),
        exercises: z.array(
          z.union([
            exerciseParser,
            z.object({
              exercises: z.tuple([exerciseParser, exerciseParser]),
            }),
          ]),
        ),
        startedAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.finishedWorkout.create({
        data: {
          name: input.name,
          exercises: input.exercises,
          startedAt: input.startedAt,
          finishedAt: new Date(),
          profile: { connect: { userId: ctx.session.user.id } },
        },
      });

      await ctx.prisma.finishedWorkout.deleteMany({
        where: {
          profile: { userId: ctx.session.user.id },
          finishedAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
        },
      });
    }),

  getManyBySession: userProcedure.query(async ({ ctx }) => {
    const finishedWorkouts = await ctx.prisma.finishedWorkout.findMany({
      where: { profile: { userId: ctx.session.user.id } },
      orderBy: { startedAt: "desc" },
    });

    return finishedWorkouts as ParseFinishedWorkout<(typeof finishedWorkouts)[number]>[];
  }),

  getByIdBySession: userProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const finishedWorkout = await ctx.prisma.finishedWorkout.findFirstOrThrow({
      where: { id: input, profile: { userId: ctx.session.user.id } },
    });

    return finishedWorkout as ParseFinishedWorkout<typeof finishedWorkout>;
  }),

  getManyByProfileId: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const finishedWorkouts = await ctx.prisma.finishedWorkout.findMany({
      where: { profileId: input },
      orderBy: { startedAt: "desc" },
    });

    return finishedWorkouts as ParseFinishedWorkout<(typeof finishedWorkouts)[number]>[];
  }),

  getById: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const finishedWorkout = await ctx.prisma.finishedWorkout.findFirstOrThrow({
      where: { id: input },
    });

    return finishedWorkout as ParseFinishedWorkout<typeof finishedWorkout>;
  }),
});
