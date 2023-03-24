import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import superjson from "superjson";
import { getServerAuthSession } from "../auth";
import { prisma } from "../db";
import { env } from "../../env/server.mjs";

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;

export const logProcedure = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  const result = await next({ ctx });
  const duration = Date.now() - start;
  if (result.ok) {
    console.log(`${type} '${path}': OK in ${duration}ms`);
  } else {
    console.log(`${type} '${path}': ERROR in ${duration}ms`);
    // console.log(result.error);
  }
  return result;
});

const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.session.user.email !== env.ADMIN_EMAIL) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({
    ctx: {
      session: {
        ...ctx.session,
        user: ctx.session.user as typeof ctx.session.user & { role: "admin" },
      },
    },
  });
});

const enforceUserIsNotAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.session.user.email === env.ADMIN_EMAIL) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({
    ctx: {
      session: {
        ...ctx.session,
        user: ctx.session.user as typeof ctx.session.user & { role: "user" },
      },
    },
  });
});

// export const publicProcedure = t.procedure.use(logProcedure);

export const adminProcedure = t.procedure.use(logProcedure).use(enforceUserIsAdmin);

export const userProcedure = t.procedure.use(logProcedure).use(enforceUserIsNotAdmin);
