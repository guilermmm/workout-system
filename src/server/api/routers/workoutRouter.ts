import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workoutRouter = createTRPCRouter({
  createWorkout: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.create({
        data: {
          name: input.name,
          user: {
            connect: {
              id: input.userId,
            },
          },
        },
      });
    }),

  updateWorkout: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        exercises: z.array(z.string()),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          exercises: {
            connect: input.exercises.map(id => ({ id })),
          },
        },
      });
    }),

  deleteWorkout: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.workout.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getWorkouts: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return (
        await ctx.prisma.workout.findMany({
          where: {
            userId: input.userId,
          },
          include: {
            exercises: {
              include: {
                exercise: {
                  select: {
                    muscleGroup: true,
                  },
                },
              },
            },
          },
        })
      ).map(workout => {
        return {
          id: workout.id,
          name: workout.name,
          createdAt: workout.createdAt,
          updatedAt: workout.updatedAt,
          userId: workout.userId,
          muscleGroups: workout.exercises.map(exercise => {
            return exercise.exercise.muscleGroup;
          }),
        };
      });
    }),

  getWorkout: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.workout.findUnique({
      where: {
        id: input.id,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
  }),
});
