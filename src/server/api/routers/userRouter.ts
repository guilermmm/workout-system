import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getProfileBySession: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.prisma.profile.findUniqueOrThrow({
      where: { email: ctx.session.user.email! },
    });

    if (profile.userId == null) {
      await ctx.prisma.profile.update({
        where: { email: profile.email },
        data: { userId: ctx.session.user.id },
      });
    }

    return await ctx.prisma.profile.findUniqueOrThrow({
      where: { email: ctx.session.user.email! },
      include: { user: true },
    });
  }),

  getProfileById: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.profile.findUniqueOrThrow({
      where: { userId: input },
      include: { user: true },
    });
  }),

  searchProfiles: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.profile.findMany({
      where: {
        OR: [{ user: { name: { contains: input } } }, { email: { contains: input } }],
      },
      include: { user: true },
      orderBy: { isActive: "desc" },
    });
  }),

  createProfile: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.profile.create({ data: { email: input.email } });
    }),

  deactivate: adminProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.profile.update({ where: { userId: input.id }, data: { isActive: false } });
  }),

  activate: adminProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.profile.update({ where: { userId: input.id }, data: { isActive: true } });
  }),
});
