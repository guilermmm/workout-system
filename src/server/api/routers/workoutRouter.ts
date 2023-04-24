import { Method, Weekday } from "@prisma/client";
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
        profileId: z.string(),
        name: z.string().min(1),
        days: z.array(z.nativeEnum(Weekday)).min(1),
        exercises: z
          .array(
            z.object({
              exerciseId: z.string(),
              sets: z.union([
                z.array(z.object({ reps: z.number().min(1), weight: z.number().min(0) })).min(1),
                z.array(z.object({ time: z.number().min(0), weight: z.number().min(0) })).min(1),
              ]),
              description: z.string().nullish(),
              method: z.nativeEnum(Method),
              index: z.number().min(0),
            }),
          )
          .min(1),
        biSets: z.array(z.tuple([z.number().min(0), z.number().min(0)])),
      }),
    )
    .mutation(({ ctx, input: { profileId, name, days, exercises, biSets } }) => {
      return ctx.prisma.$transaction(async tx => {
        const workout = await tx.workout.create({
          data: {
            name,
            days,
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

        return await tx.workout.update({ where: { id: workout.id }, data: { biSets: biSetsData } });
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        days: z.array(z.nativeEnum(Weekday)).min(1),
        exercises: z
          .array(
            z.object({
              id: z.string().optional(),
              exerciseId: z.string(),
              sets: z.union([
                z.array(z.object({ reps: z.number().min(1), weight: z.number().min(0) })).min(1),
                z.array(z.object({ time: z.number().min(0), weight: z.number().min(0) })).min(1),
              ]),
              description: z.string().nullish(),
              method: z.nativeEnum(Method),
              index: z.number().min(0),
            }),
          )
          .min(1),
        biSets: z.array(z.tuple([z.number().min(0), z.number().min(0)])),
      }),
    )
    .mutation(async ({ ctx, input: { id: workoutId, name, days, exercises, biSets } }) => {
      return ctx.prisma.$transaction(async tx => {
        const workout = await tx.workout.update({
          where: { id: workoutId },
          data: { name, days },
          include: { exercises: { include: { exercise: true } } },
        });

        const exercisesToCreate = exercises.filter(exercise => typeof exercise.id !== "string");

        await tx.exerciseInWorkout.createMany({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          data: exercisesToCreate.map(({ id: _, ...exercise }) => ({
            workoutId,
            ...exercise,
          })),
        });

        const exercisesToUpdate = exercises.filter(exercise =>
          workout.exercises.some(e => exercise.id === e.id),
        );

        await Promise.all(
          exercisesToUpdate.map(async ({ id, ...exercise }) => {
            await tx.exerciseInWorkout.update({
              where: { id },
              data: exercise,
            });
          }),
        );

        const exercisesToDelete = workout.exercises.filter(exercise =>
          exercises.every(e => exercise.id !== e.id),
        );

        await tx.exerciseInWorkout.deleteMany({
          where: { id: { in: exercisesToDelete.map(exercise => exercise.id) } },
        });

        const { exercises: newExercises } = await tx.workout.findUniqueOrThrow({
          where: { id: workoutId },
          include: { exercises: { include: { exercise: true } } },
        });

        const biSetsData = biSets.map(([index1, index2]) => [
          newExercises.find(exercise => exercise.index === index1)!.id,
          newExercises.find(exercise => exercise.index === index2)!.id,
        ]);

        return await tx.workout.update({ where: { id: workoutId }, data: { biSets: biSetsData } });
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input: { id } }) => ctx.prisma.workout.delete({ where: { id } })),
});
