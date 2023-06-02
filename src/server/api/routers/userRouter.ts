import { z } from "zod";
import { adminProcedure, createTRPCRouter, superAdminProcedure, userProcedure } from "../trpc";

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

  getAdminProfileBySession: adminProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.adminProfile.findUniqueOrThrow({
      where: { email: ctx.session.user.email! },
      include: { user: true },
    });

    if (profile.userId == null) {
      await ctx.prisma.adminProfile.update({
        where: { email: profile.email },
        data: { userId: ctx.session.user.id, name: ctx.session.user.name! },
        include: { user: true },
      });
    }
  }),

  getAdminProfiles: adminProcedure
    .input(
      z.object({
        search: z.string(),
      }),
    )
    .query(async ({ ctx, input: { search } }) => {
      return ctx.prisma.adminProfile.findMany({
        where: {
          OR: [{ user: { name: { contains: search } } }, { email: { contains: search } }],
        },
        include: { user: true },
      });
    }),

  deleteAdminProfile: superAdminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await ctx.prisma.adminProfile.delete({ where: { id: input } });
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
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.profile.create({ data: { email: input.email } });
    }),

  createAdminProfile: superAdminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.adminProfile.create({ data: { email: input.email } });
    }),

  updateProfile: adminProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email(),
        birthdate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.profile.update({
        where: { id: input.id },
        data: { email: input.email, birthdate: input.birthdate },
      });
    }),

  deleteAdminProfileByEmail: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.adminProfile.delete({ where: { id: input.id } });
    }),

  deactivate: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ ctx, input: { profileId } }) => {
      await ctx.prisma.profile.update({ where: { id: profileId }, data: { isActive: false } });
    }),

  activate: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ ctx, input: { profileId } }) => {
      await ctx.prisma.profile.update({ where: { id: profileId }, data: { isActive: true } });
    }),

  updateWorkoutDate: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { profileId } }) => {
      await ctx.prisma.profile.update({
        where: { id: profileId },
        data: { workoutUpdateDate: new Date() },
      });
    }),
});
