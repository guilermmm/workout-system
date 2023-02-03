import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }))
    .query(({ ctx, input }) => {
      return `Hello ${input.text}`;
    }),

  getSecretMessage: protectedProcedure.query(({ ctx }) => {
    return `Secret message for ${ctx.session.user.email}`;
  }),

  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        email: ctx.session.user.email ?? undefined,
      },
    });
  }),
});
