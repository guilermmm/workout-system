import type { Datasheet } from "@prisma/client";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

const datasheetInputModel = z.object({
  weight: z.number().multipleOf(0.1),
  height: z.number().multipleOf(0.1),
  thorax: z.number().multipleOf(0.1),
  waist: z.number().multipleOf(0.1),
  abdomen: z.number().multipleOf(0.1),
  hips: z.number().multipleOf(0.1),
  rightThigh: z.number().multipleOf(0.1),
  leftThigh: z.number().multipleOf(0.1),
  rightArm: z.number().multipleOf(0.1),
  leftArm: z.number().multipleOf(0.1),
  rightCalf: z.number().multipleOf(0.1),
  leftCalf: z.number().multipleOf(0.1),
});

const parseRequest = (
  datasheet: z.infer<typeof datasheetInputModel>,
): z.infer<typeof datasheetInputModel> => {
  return {
    weight: Math.floor(datasheet.weight * 10),
    height: Math.floor(datasheet.height * 10),
    thorax: Math.floor(datasheet.thorax * 10),
    waist: Math.floor(datasheet.waist * 10),
    abdomen: Math.floor(datasheet.abdomen * 10),
    hips: Math.floor(datasheet.hips * 10),
    leftArm: Math.floor(datasheet.leftArm * 10),
    rightArm: Math.floor(datasheet.rightArm * 10),
    leftThigh: Math.floor(datasheet.leftThigh * 10),
    rightThigh: Math.floor(datasheet.rightThigh * 10),
    leftCalf: Math.floor(datasheet.leftCalf * 10),
    rightCalf: Math.floor(datasheet.rightCalf * 10),
  };
};

const datasheetInput = datasheetInputModel.transform(parseRequest);

const parseResponse = (datasheet: Datasheet): Datasheet => {
  return {
    id: datasheet.id,
    profileId: datasheet.profileId,
    weight: datasheet.weight / 10,
    height: datasheet.height / 10,
    thorax: datasheet.thorax / 10,
    waist: datasheet.waist / 10,
    abdomen: datasheet.abdomen / 10,
    hips: datasheet.hips / 10,
    leftArm: datasheet.leftArm / 10,
    rightArm: datasheet.rightArm / 10,
    leftThigh: datasheet.leftThigh / 10,
    rightThigh: datasheet.rightThigh / 10,
    leftCalf: datasheet.leftCalf / 10,
    rightCalf: datasheet.rightCalf / 10,
    createdAt: datasheet.createdAt,
  };
};

export const datasheetRouter = createTRPCRouter({
  getLatest: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input: { profileId } }) => {
      const latest = await ctx.prisma.datasheet.findFirst({
        where: { profileId },
        orderBy: { createdAt: "desc" },
      });

      if (latest) {
        return { latest: parseResponse(latest) };
      } else {
        return { latest: null };
      }
    }),

  getLatestBySession: userProcedure.query(async ({ ctx }) => {
    const latest = await ctx.prisma.datasheet.findFirst({
      where: { profile: { userId: ctx.session.user.id } },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      return { latest: parseResponse(latest) };
    } else {
      return { latest: null };
    }
  }),

  getMany: adminProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ ctx, input: { profileId } }) => {
      return (
        await ctx.prisma.datasheet.findMany({
          where: { profileId },
          orderBy: { createdAt: "desc" },
        })
      ).map(parseResponse);
    }),

  getManyBySession: userProcedure.query(async ({ ctx }) => {
    return (
      await ctx.prisma.datasheet.findMany({
        where: { profile: { userId: ctx.session.user.id } },
        orderBy: { createdAt: "desc" },
      })
    ).map(parseResponse);
  }),

  create: adminProcedure
    .input(
      z.object({
        profileId: z.string(),
        datasheet: datasheetInput,
      }),
    )
    .mutation(async ({ ctx, input: { profileId, datasheet } }) => {
      await ctx.prisma.datasheet.create({ data: { profileId, ...datasheet } });
    }),

  createBySession: userProcedure.input(datasheetInput).mutation(async ({ ctx, input }) => {
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
