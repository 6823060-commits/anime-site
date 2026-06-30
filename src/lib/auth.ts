import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan, planExpiresAt: user.planExpiresAt };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
        token.planExpiresAt = (user as any).planExpiresAt;
      }
      // Refresh plan on update
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { plan: true, planExpiresAt: true } });
        if (dbUser) { token.plan = dbUser.plan; token.planExpiresAt = dbUser.planExpiresAt; }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).plan = token.plan;
        (session.user as any).planExpiresAt = token.planExpiresAt;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
  secret: process.env.NEXTAUTH_SECRET,
});
