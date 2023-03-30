import { Method } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { ParseJsonValues } from "../../../utils/types";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

export const workoutRouter = createTRPCRouter({
  getMany: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workouts = await ctx.prisma.workout.findMany({
        where: { profileId: input.profileId },
        include: { exercises: { include: { exercise: { select: { category: true } } } } },
      });
      const mappedWorkouts = workouts.map(workout => ({
        ...workout,
        categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
      }));

      return mappedWorkouts as ParseJsonValues<typeof mappedWorkouts>;
    }),

  getById: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const workout = await ctx.prisma.workout.findUniqueOrThrow({
      where: { id: input },
      include: { exercises: { include: { exercise: true } }, profile: { include: { user: true } } },
    });

    return workout as ParseJsonValues<typeof workout>;
  }),

  getManyBySession: userProcedure.query(async ({ ctx }) => {
    const workouts = await ctx.prisma.workout.findMany({
      where: { profile: { userId: ctx.session.user.id } },
      include: { exercises: { include: { exercise: { select: { category: true } } } } },
    });
    const mappedWorkouts = workouts.map(workout => ({
      ...workout,
      categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
    }));

    return mappedWorkouts as ParseJsonValues<typeof mappedWorkouts>;
  }),

  getByIdBySession: userProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const workout = await ctx.prisma.workout.findUniqueOrThrow({
      where: { id: input },
      include: {
        exercises: { include: { exercise: true } },
        profile: { include: { user: { select: { id: true } } } },
      },
    });

    if (workout.profile.user?.id !== ctx.session.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return workout as ParseJsonValues<typeof workout>;
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        profileId: z.string(),
        exercises: z.array(
          z.object({
            exerciseId: z.string(),
            sets: z
              .array(z.object({ reps: z.number(), weight: z.number() }))
              .or(z.array(z.object({ time: z.number(), weight: z.number() }))),
            description: z.string().nullish(),
            method: z.nativeEnum(Method),
            index: z.number(),
          }),
        ),
        biSets: z.array(z.tuple([z.number(), z.number()])),
      }),
    )
    .mutation(async ({ ctx, input: { name, profileId, biSets, exercises } }) => {
      const workout = await ctx.prisma.workout.create({
        data: {
          name,
          biSets: [],
          profile: { connect: { id: profileId } },
          exercises: { createMany: { data: exercises } },
        },
        include: { exercises: true },
      });

      const biSetsData = biSets.map(([index1, index2]) => [
        workout.exercises.find(exercise => exercise.index === index1)!.id,
        workout.exercises.find(exercise => exercise.index === index2)!.id,
      ]);

      await ctx.prisma.workout.update({ where: { id: workout.id }, data: { biSets: biSetsData } });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        exercises: z.object({
          create: z.array(
            z.object({
              exerciseId: z.string(),
              sets: z
                .array(z.object({ reps: z.number(), weight: z.number() }))
                .or(z.array(z.object({ time: z.number(), weight: z.number() }))),
              description: z.string().nullish(),
              method: z.nativeEnum(Method),
              index: z.number(),
            }),
          ),
          update: z.array(
            z.object({
              id: z.string(),
              exerciseId: z.string(),
              sets: z
                .array(z.object({ reps: z.number(), weight: z.number() }))
                .or(z.array(z.object({ time: z.number(), weight: z.number() }))),
              description: z.string().nullish(),
              method: z.nativeEnum(Method),
              index: z.number(),
            }),
          ),
          delete: z.array(z.string()),
        }),
        biSets: z.array(z.tuple([z.string(), z.string()])),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.update({
        where: { id: input.id },
        data: {
          name: input.name,
          exercises: {
            createMany: { data: input.exercises.create },
            updateMany: input.exercises.update.map(({ id, exerciseId, ...exercise }) => ({
              where: { id },
              data: { exercise: { connect: { id: exerciseId } }, ...exercise },
            })),
            deleteMany: input.exercises.delete.map(id => ({ id })),
          },
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input: { id } }) => ctx.prisma.workout.delete({ where: { id } })),
});
