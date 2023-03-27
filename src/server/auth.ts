import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Simplify } from "@trpc/server";
import type { GetServerSidePropsContext } from "next";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "../env/server.mjs";
import { prisma } from "./db";

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: Simplify<{ id: string } & { role: "admin" | "user" } & DefaultSession["user"]>;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = env.ADMIN_EMAIL === user.email ? "admin" : "user";
      }
      return session;
    },

    async signIn({ user }) {
      if (user.email == null) {
        return false;
      }

      if (user.email === env.ADMIN_EMAIL) {
        return true;
      }

      const profile = await prisma.profile.findUnique({ where: { email: user.email } });

      if (!profile) {
        // TODO: redirect to a page telling the user he doesn't have access
        return false;
      }

      if (!profile.isActive) {
        // TODO: redirect to a page telling the user his account is inactive
        return false;
      }

      if (profile.userId == null) {
        await prisma.profile.update({ where: { id: profile.id }, data: { userId: user.id } });
      }

      return true;
    },
  },

  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     **/
  ],
};

/**
 * Wrapper for getServerSession so that you don't need
 * to import the authOptions in every file.
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
