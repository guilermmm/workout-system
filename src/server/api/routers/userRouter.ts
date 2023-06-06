import { TRPCError } from "@trpc/server";
import { hash, verify } from "argon2";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, superAdminProcedure, userProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getProfileBySession: userProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUniqueOrThrow({
      where: { email: ctx.session.user.email! },
      include: { user: true },
    });

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
        data: { user: { connect: { email: profile.email } } },
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
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.profile.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (user !== null && user.userId !== null) {
        await ctx.prisma.user.update({
          where: { id: user.userId },
          data: { email: input.email, name: input.name },
        });
      }

      const birthdate = new Date(input.birthdate);
      birthdate.setUTCHours(0, 0, 0, 0);
      await ctx.prisma.profile.update({
        where: { id: input.id },
        data: { email: input.email, birthdate },
      });
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

  deleteProfile: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const profile = await ctx.prisma.profile.findUniqueOrThrow({
      where: { id: input },
      select: { user: true },
    });

    if (profile.user !== null) {
      if (profile?.user?.credentialsId) {
        await ctx.prisma.credentials.delete({ where: { id: profile.user.credentialsId } });
      } else {
        await ctx.prisma.user.delete({ where: { id: profile.user.id } });
      }
    }

    await ctx.prisma.profile.delete({ where: { id: input } });
  }),

  deleteAdminProfile: superAdminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await ctx.prisma.adminProfile.delete({ where: { id: input } });
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

  createUser: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
        name: z.string(),
        password: z.string().min(6),
        image: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input: { profileId, name, password, image } }) => {
      const profile = await ctx.prisma.profile.findUnique({ where: { id: profileId } });
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      if (profile.userId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "User already exists" });
      }

      const user = await ctx.prisma.user.create({
        data: {
          name,
          email: profile.email,
          image,
          profile: { connect: { id: profileId } },
        },
        select: { id: true },
      });

      const hashedPassword = await hash(password);

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          credentials: {
            create: {
              id: user.id,
              password: hashedPassword,
            },
          },
        },
      });
    }),

  updatePassword: userProcedure
    .input(z.object({ oldPassword: z.string(), newPassword: z.string().min(6) }))
    .mutation(async ({ ctx, input: { oldPassword, newPassword } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { credentials: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (!user.credentials) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "User has no credentials" });
      }

      const isValid = await verify(user.credentials.password, oldPassword);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
      }

      const password = await hash(newPassword);

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { credentials: { update: { password } } },
      });
    }),

  updateUserPassword: adminProcedure
    .input(z.object({ userId: z.string(), newPassword: z.string().min(6) }))
    .mutation(async ({ ctx, input: { userId, newPassword } }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: { credentials: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (!user.credentials) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "User has no credentials" });
      }

      const password = await hash(newPassword);

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { credentials: { update: { password } } },
      });
    }),
});
