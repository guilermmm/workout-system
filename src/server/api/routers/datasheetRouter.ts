import { z } from "zod";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

export const datasheetRouter = createTRPCRouter({
  getLatest: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(({ ctx, input: { profileId } }) => {
      return ctx.prisma.datasheet.findFirstOrThrow({
        where: { profileId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getLatestBySession: userProcedure.query(({ ctx }) => {
    return ctx.prisma.datasheet.findFirstOrThrow({
      where: { profile: { userId: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getMany: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(({ ctx, input: { profileId } }) => {
      return ctx.prisma.datasheet.findMany({
        where: { profileId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getManyBySession: userProcedure.query(({ ctx }) => {
    return ctx.prisma.datasheet.findMany({
      where: { profile: { userId: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: adminProcedure
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
      await ctx.prisma.datasheet.create({ data: input });
    }),

  createBySession: userProcedure
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
});
