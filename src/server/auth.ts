import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Simplify } from "@trpc/server";
import * as argon2 from "argon2";
import type { GetServerSidePropsContext } from "next";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getSession } from "next-auth/react";
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
    async session({ session }) {
      if (!session.user || !session.user.email) {
        throw new Error("Invalid session");
      }

      if (session.user.email === env.ADMIN_EMAIL) {
        const admin = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });

        if (!admin) {
          throw new Error("Admin not found");
        }

        session.user.id = admin.id;
        session.user.role = "admin";
        return session;
      }

      const adminProfile = await prisma.adminProfile.findUnique({
        where: { email: session.user.email },
        select: { userId: true },
      });
      if (adminProfile) {
        session.user.id = adminProfile.userId!;
        session.user.role = "admin";
        return session;
      }

      const profile = await prisma.profile.findFirst({
        where: { email: session.user.email, isActive: true },
        select: { userId: true },
      });

      if (profile) {
        session.user.id = profile.userId!;
        session.user.role = "user";
        return session;
      }

      throw new Error("User not found");
    },

    async signIn({ user }) {
      if (user.email == null) {
        return false;
      }

      if (user.email === env.ADMIN_EMAIL) {
        return true;
      }

      const adminProfile = await prisma.adminProfile.findUnique({
        where: { email: user.email },
        select: { email: true },
      });

      if (adminProfile) return true;

      const profile = await prisma.profile.findUnique({
        where: { email: user.email },
        select: { isActive: true },
      });

      if (!profile || !profile.isActive) {
        return "/unauthorized";
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },

  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || credentials.email == null || credentials.password == null) {
          throw new Error("Credenciais inválidas");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { credentials: true },
        });

        if (!user || !user.credentials) {
          throw new Error("Credenciais inválidas");
        }

        const isValid = await argon2.verify(user.credentials.password, credentials.password);

        if (!isValid) {
          throw new Error("Credenciais inválidas");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
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
  return getSession(ctx);
};
