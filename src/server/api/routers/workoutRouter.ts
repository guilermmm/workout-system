import { Method } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

export const workoutRouter = createTRPCRouter({
  createWorkout: adminProcedure
    .input(z.object({ name: z.string(), profileId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.create({
        data: { name: input.name, profile: { connect: { id: input.profileId } } },
      });
    }),

  updateWorkout: adminProcedure
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
            }),
          ),
          delete: z.array(z.string()),
        }),
        biSets: z.array(z.tuple([z.string(), z.string()])),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

  deleteWorkout: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.prisma.workout.delete({ where: { id: input.id } })),

  getWorkouts: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workouts = await ctx.prisma.workout.findMany({
        where: { profileId: input.profileId },
        include: { exercises: { include: { exercise: { select: { category: true } } } } },
      });
      return workouts.map(workout => ({
        ...workout,
        categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
      }));
    }),

  getWorkout: adminProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.workout.findUniqueOrThrow({
      where: { id: input.id },
      include: { exercises: { include: { exercise: true } }, profile: { include: { user: true } } },
    });
  }),

  getWorkoutsBySession: userProcedure.query(async ({ ctx }) => {
    const workouts = await ctx.prisma.workout.findMany({
      where: { profileId: ctx.session.user.profile.id },
      include: { exercises: { include: { exercise: { select: { category: true } } } } },
    });
    return workouts.map(workout => ({
      ...workout,
      categories: [...new Set(workout.exercises.map(exercise => exercise.exercise.category))],
    }));
  }),

  getWorkoutBySession: userProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workout = await ctx.prisma.workout.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          exercises: { include: { exercise: true } },
          profile: { include: { user: true } },
        },
      });

      if (workout.profileId !== ctx.session.user.profile.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return workout;
    }),
});
