import { z } from "zod";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getProfileBySession: userProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUniqueOrThrow({
      where: { email: ctx.session.user.email! },
      include: { user: true },
    });

    if (profile.userId == null) {
      const updatedProfile = await ctx.prisma.profile.update({
        where: { email: profile.email },
        data: { userId: ctx.session.user.id },
        include: { user: true },
      });

      return updatedProfile;
    }

    return profile;
  }),

  getProfileById: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.profile.findUniqueOrThrow({
      where: { id: input },
      include: { user: true },
    });
  }),

  searchProfiles: adminProcedure
    .input(
      z.object({
        search: z.string(),
        limit: z.number().min(1).max(20).optional().default(20),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input: { search, cursor, limit } }) => {
      const items = await ctx.prisma.profile.findMany({
        take: limit + 1,
        where: {
          OR: [{ user: { name: { contains: search } } }, { email: { contains: search } }],
        },
        cursor: cursor ? { id: cursor } : undefined,
        include: { user: true },
        orderBy: { id: "asc" },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return { items, nextCursor };
    }),

  createProfile: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.profile.create({ data: { email: input.email } });
    }),

  deactivate: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(({ ctx, input: { profileId } }) => {
      return ctx.prisma.profile.update({ where: { id: profileId }, data: { isActive: false } });
    }),

  activate: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(({ ctx, input: { profileId } }) => {
      return ctx.prisma.profile.update({ where: { id: profileId }, data: { isActive: true } });
    }),

  getLatestDatasheet: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input: { profileId } }) => {
      return ctx.prisma.datasheet.findFirstOrThrow({
        where: { profileId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getDatasheets: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input: { profileId } }) => {
      return ctx.prisma.datasheet.findMany({
        where: { profileId },
        orderBy: { createdAt: "desc" },
      });
    }),

  createDatasheet: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
        weight: z.number(),
        height: z.number(),
        thorax: z.number(),
        waist: z.number(),
        abdomen: z.number(),
        hips: z.number(),
        rightThigh: z.number(),
        leftThigh: z.number(),
        rightArm: z.number(),
        leftArm: z.number(),
        rightCalf: z.number(),
        leftCalf: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.datasheet.create({
        data: {
          ...input,
        },
      });
    }),

  getLatestDatasheetBySession: userProcedure.query(async ({ ctx }) => {
    return ctx.prisma.datasheet.findFirstOrThrow({
      where: { profile: { userId: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getDatasheetsBySession: userProcedure.query(async ({ ctx }) => {
    return ctx.prisma.datasheet.findMany({
      where: { profile: { userId: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
    });
  }),

  createDatasheetBySession: userProcedure
    .input(
      z.object({
        weight: z.number(),
        height: z.number(),
        thorax: z.number(),
        waist: z.number(),
        abdomen: z.number(),
        hips: z.number(),
        rightThigh: z.number(),
        leftThigh: z.number(),
        rightArm: z.number(),
        leftArm: z.number(),
        rightCalf: z.number(),
        leftCalf: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUniqueOrThrow({
        where: { userId: ctx.session.user.id },
      });

      return ctx.prisma.datasheet.create({
        data: {
          ...input,
          profileId: profile.id,
        },
      });
    }),

  getFinishedWorkouts: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input: { profileId } }) => {
      return ctx.prisma.finishedWorkout.findMany({
        where: { profileId },
        orderBy: { date: "desc" },
      });
    }),

  getFinishedWorkoutsBySession: userProcedure.query(async ({ ctx }) => {
    return ctx.prisma.finishedWorkout.findMany({
      where: { profile: { userId: ctx.session.user.id } },
      orderBy: { date: "desc" },
    });
  }),
});
