import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getSessionUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUniqueOrThrow({
      where: { email: ctx.session.user.email ?? undefined },
    });
  }),

  getUserById: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findUniqueOrThrow({ where: { id: input } });
  }),

  searchUsers: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findMany({
      where: {
        OR: [{ name: { contains: input } }, { email: { contains: input } }],
        isInstructor: false,
      },
      orderBy: { isActive: "desc" },
    });
  }),
});
