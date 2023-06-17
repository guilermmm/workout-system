import { Method, Weekday } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { ParseJsonValues, Sets } from "../../../utils/types";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

const validateBiSets = (workout: { biSets: [number, number][]; exercises: unknown[] }) => {
  const biSets = workout.biSets.flat();
  const isUnique = biSets.length === new Set(biSets).size;
  const isValid = biSets.every(index => workout.exercises.length > index);
  return isUnique && isValid;
};

const validateBiSetsSets = (workout: {
  biSets: [number, number][];
  exercises: { sets: unknown[] }[];
}) => {
  const biSets = workout.biSets.map(
    ([index1, index2]) =>
      [
        workout.exercises.find((_, i) => i === index1)!,
        workout.exercises.find((_, i) => i === index2)!,
      ] as const,
  );
  return biSets.every(
    ([exercise1, exercise2]) => exercise1?.sets.length === exercise2?.sets.length,
  );
};

export const workoutRouter = createTRPCRouter({
  getMany: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workouts = await ctx.prisma.workout.findMany({
        where: { profileId: input.profileId },
        include: { exercises: { include: { exercise: { select: { category: true } } } } },
        orderBy: { name: "asc" },
      });

      const mappedWorkouts = workouts.map(workout => ({
        id: workout.id,
        profileId: workout.profileId,
        name: workout.name,
        days: workout.days,
        createdAt: workout.createdAt,
        updatedAt: workout.updatedAt,
        categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
      }));

      return mappedWorkouts as ParseJsonValues<typeof mappedWorkouts>;
    }),

  getById: adminProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const workout = await ctx.prisma.workout.findUniqueOrThrow({
      where: { id: input },
      include: {
        exercises: {
          include: { exercise: { select: { id: true, category: true, name: true, image: false } } },
        },
        profile: { include: { user: true } },
      },
    });

    workout.exercises.sort((a, b) => a.index - b.index);

    return workout as ParseJsonValues<typeof workout>;
  }),

  getManyBySession: userProcedure.query(async ({ ctx }) => {
    const workouts = await ctx.prisma.workout.findMany({
      where: { profile: { userId: ctx.session.user.id } },
      include: { exercises: { include: { exercise: true } } },
      orderBy: { name: "asc" },
    });

    const mappedWorkouts = workouts.map(workout => ({
      id: workout.id,
      profileId: workout.profileId,
      name: workout.name,
      days: workout.days,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
      categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
    }));

    return mappedWorkouts as ParseJsonValues<typeof mappedWorkouts>;
  }),

  getByIdBySession: userProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const workout = await ctx.prisma.workout.findFirstOrThrow({
      where: { id: input, profile: { userId: ctx.session.user.id } },
      include: {
        exercises: {
          include: { exercise: { select: { id: true, category: true, name: true, image: false } } },
        },
      },
    });

    workout.exercises.sort((a, b) => a.index - b.index);

    return workout as ParseJsonValues<typeof workout>;
  }),

  getManyWithExercises: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workouts = await ctx.prisma.workout.findMany({
        where: { profileId: input.profileId },
        include: {
          exercises: {
            include: {
              exercise: { select: { image: false, id: true, category: true, name: true } },
            },
          },
        },
        orderBy: { name: "asc" },
      });

      const mappedWorkouts = workouts.map(workout => ({
        ...workout,
        categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
      }));

      return mappedWorkouts as ParseJsonValues<typeof mappedWorkouts>;
    }),

  getManyWithExercisesBySession: userProcedure.query(async ({ ctx }) => {
    const workouts = await ctx.prisma.workout.findMany({
      where: { profile: { userId: ctx.session.user.id } },
      include: {
        exercises: {
          include: {
            exercise: { select: { image: false, id: true, category: true, name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const mappedWorkouts = workouts.map(workout => ({
      ...workout,
      categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
    }));

    return mappedWorkouts as ParseJsonValues<typeof mappedWorkouts>;
  }),

  create: adminProcedure
    .input(
      z
        .object({
          profileId: z.string(),
          name: z.string().min(1),
          days: z.array(z.nativeEnum(Weekday)).min(1),
          exercises: z
            .array(
              z.object({
                exerciseId: z.string(),
                sets: z.union([
                  z
                    .array(z.object({ reps: z.string().trim().min(1), weight: z.number().min(0) }))
                    .min(1),
                  z.array(z.object({ time: z.number().min(0), weight: z.number().min(0) })).min(1),
                ]),
                description: z.string().nullish(),
                method: z.nativeEnum(Method),
              }),
            )
            .min(1),
          biSets: z.array(z.tuple([z.number().min(0), z.number().min(0)])),
        })
        .refine(validateBiSets, "BiSets must be unique and refer to valid exercises")
        .refine(validateBiSetsSets, "BiSets must refer to exercises with the same number of sets"),
    )
    .mutation(async ({ ctx, input: { profileId, name, days, exercises, biSets } }) => {
      await ctx.prisma.$transaction(async tx => {
        const workout = await tx.workout.create({
          data: {
            name,
            days,
            biSets: [],
            profile: { connect: { id: profileId } },
            exercises: { createMany: { data: exercises.map((e, index) => ({ ...e, index })) } },
          },
          include: { exercises: true },
        });

        const biSetsData = biSets.map(([index1, index2]) => [
          workout.exercises.find(exercise => exercise.index === index1)!.id,
          workout.exercises.find(exercise => exercise.index === index2)!.id,
        ]);

        await tx.workout.update({ where: { id: workout.id }, data: { biSets: biSetsData } });
      });
    }),

  update: adminProcedure
    .input(
      z
        .object({
          id: z.string(),
          name: z.string().min(1),
          days: z.array(z.nativeEnum(Weekday)).min(1),
          exercises: z
            .array(
              z.object({
                exerciseId: z.string(),
                sets: z.union([
                  z
                    .array(z.object({ reps: z.string().trim().min(1), weight: z.number().min(0) }))
                    .min(1),
                  z.array(z.object({ time: z.number().min(0), weight: z.number().min(0) })).min(1),
                ]),
                description: z.string().nullish(),
                method: z.nativeEnum(Method),
              }),
            )
            .min(1),
          biSets: z.array(z.tuple([z.number().min(0), z.number().min(0)])),
        })
        .refine(validateBiSets, "BiSets must be unique and refer to valid exercises")
        .refine(validateBiSetsSets, "BiSets must refer to exercises with the same number of sets"),
    )
    .mutation(async ({ ctx, input: { id: workoutId, name, days, exercises, biSets } }) => {
      await ctx.prisma.$transaction(async tx => {
        await tx.exerciseInWorkout.deleteMany({
          where: { workoutId },
        });

        await tx.exerciseInWorkout.createMany({
          data: exercises.map((exercise, index) => ({
            workoutId,
            ...exercise,
            index,
          })),
        });

        const { exercises: newExercises } = await tx.workout.findUniqueOrThrow({
          where: { id: workoutId },
          include: {
            exercises: {
              include: {
                exercise: { select: { id: true, category: true, name: true, image: false } },
              },
            },
          },
        });

        const biSetsData = biSets.map(([index1, index2]) => [
          newExercises.find(exercise => exercise.index === index1)!.id,
          newExercises.find(exercise => exercise.index === index2)!.id,
        ]);

        await tx.workout.update({
          where: { id: workoutId },
          data: { name, days, biSets: biSetsData },
        });
      });
    }),

  updateWeightsBySession: userProcedure
    .input(
      z.object({
        workoutId: z.string(),
        exercises: z.array(
          z.object({
            id: z.string(),
            sets: z.array(z.number().min(0)),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input: { workoutId, exercises } }) => {
      const unsafeWorkout = await ctx.prisma.workout.findFirstOrThrow({
        where: { id: workoutId, profile: { userId: ctx.session.user.id } },
        include: { exercises: true },
      });
      const workout = unsafeWorkout as ParseJsonValues<typeof unsafeWorkout>;

      const isValid = exercises.every(({ id: exerciseId, sets }) =>
        workout.exercises.some(
          ({ id: workoutExerciseId, sets: workoutExerciseSets }) =>
            exerciseId === workoutExerciseId && sets.length === workoutExerciseSets.length,
        ),
      );

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Entrada inválida, verifique se os exercícios e séries estão corretos",
        });
      }

      const updatedExercises = exercises.map(({ id, sets }) => {
        const exercise = workout.exercises.find(exercise => exercise.id === id)!;

        exercise.sets = exercise.sets.map((set, index) => {
          set.weight = sets[index]!;
          return set;
        }) as Sets;

        return exercise;
      });

      await ctx.prisma.$transaction(
        updatedExercises.map(({ id, sets }) =>
          ctx.prisma.exerciseInWorkout.updateMany({
            where: { id },
            data: { sets },
          }),
        ),
      );
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => await ctx.prisma.workout.delete({ where: { id } })),
});
