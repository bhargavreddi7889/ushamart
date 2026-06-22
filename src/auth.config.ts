import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config — used by middleware only.
 * Do NOT import Prisma, bcrypt, or Credentials provider here.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
        session.user.phone = token.phone as string | null | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
