import type { Datasheet } from "@prisma/client";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

const datasheetInputModel = z.object({
  weight: z.number().min(0),
  height: z.number().min(0),
  thorax: z.number().min(0),
  waist: z.number().min(0),
  abdomen: z.number().min(0),
  hips: z.number().min(0),
  rightThigh: z.number().min(0),
  leftThigh: z.number().min(0),
  rightArm: z.number().min(0),
  leftArm: z.number().min(0),
  rightCalf: z.number().min(0),
  leftCalf: z.number().min(0),
});

const parseRequest = (
  datasheet: z.infer<typeof datasheetInputModel>,
): z.infer<typeof datasheetInputModel> => {
  return {
    weight: Math.round(datasheet.weight * 100) * 10,
    height: Math.round(datasheet.height * 10),
    thorax: Math.round(datasheet.thorax * 10),
    waist: Math.round(datasheet.waist * 10),
    abdomen: Math.round(datasheet.abdomen * 10),
    hips: Math.round(datasheet.hips * 10),
    leftArm: Math.round(datasheet.leftArm * 10),
    rightArm: Math.round(datasheet.rightArm * 10),
    leftThigh: Math.round(datasheet.leftThigh * 10),
    rightThigh: Math.round(datasheet.rightThigh * 10),
    leftCalf: Math.round(datasheet.leftCalf * 10),
    rightCalf: Math.round(datasheet.rightCalf * 10),
  };
};

const datasheetInput = datasheetInputModel.transform(parseRequest);

const parseResponse = (datasheet: Datasheet): Datasheet => {
  return {
    id: datasheet.id,
    profileId: datasheet.profileId,
    weight: datasheet.weight / 1000,
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
