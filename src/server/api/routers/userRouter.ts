import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getSessionUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { email: ctx.session.user.email ?? undefined },
    });
  }),

  getUserById: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findUniqueOrThrow({ where: { id: input } });
  }),

  searchUsers: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findMany({
      where: {
        OR: [{ name: { contains: input } }, { email: { contains: input } }],
        isInstructor: false,
      },
      orderBy: { isActive: "desc" },
    });
  }),

  deactivate: adminProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.user.update({ where: { id: input.id }, data: { isActive: false } });
  }),

  activate: adminProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.user.update({ where: { id: input.id }, data: { isActive: true } });
  }),
});
