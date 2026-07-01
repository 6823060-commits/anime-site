import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";  // ← нэмэх
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { isLocked, lockRemainingMinutes, recordFailedAttempt, resetFailedAttempts } from "./account-lock";
import { rateLimit } from "./rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({                                      // ← нэмэх
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        // Rate limit per email
        if (!rateLimit(`login:${email}`, 10, 15 * 60 * 1000)) {
          throw new Error("Хэт олон оролдлого. Түр хүлээнэ үү.");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          await prisma.loginLog.create({ data: { email, success: false, reason: "NOT_FOUND" } });
          return null;
        }

        // Account locked?
        if (isLocked(user.lockedUntil)) {
          await prisma.loginLog.create({ data: { userId: user.id, email, success: false, reason: "LOCKED" } });
          throw new Error(`Бүртгэл түр блоклогдсон. ${lockRemainingMinutes(user.lockedUntil)} минутын дараа дахин оролдоно уу.`);
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          await recordFailedAttempt(user.id);
          await prisma.loginLog.create({ data: { userId: user.id, email, success: false, reason: "WRONG_PASSWORD" } });
          return null;
        }

        // Success — reset attempts
        await resetFailedAttempts(user.id);
        await prisma.loginLog.create({ data: { userId: user.id, email, success: true, reason: "SUCCESS" } });

        return { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan, planExpiresAt: user.planExpiresAt };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google нэвтрэлт — анх удаа орж ирвэл DB-д үүсгэх
      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!existing) {
          const created = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              password: "", // OAuth хэрэглэгчид нууц үг хэрэггүй
              emailVerified: true,
              googleId: account.providerAccountId,
            },
          });
          user.id = created.id;
          (user as any).role = created.role;
          (user as any).plan = created.plan;
        } else {
          user.id = existing.id;
          (user as any).role = existing.role;
          (user as any).plan = existing.plan;
          (user as any).planExpiresAt = existing.planExpiresAt;
          if (!existing.googleId) {
            await prisma.user.update({ where: { id: existing.id }, data: { googleId: account.providerAccountId, emailVerified: true } });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
        token.planExpiresAt = (user as any).planExpiresAt;
      }
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { plan: true, planExpiresAt: true } });
        if (dbUser) { token.plan = dbUser.plan; token.planExpiresAt = dbUser.planExpiresAt; }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      (session.user as any).plan = token.plan;
      (session.user as any).planExpiresAt = token.planExpiresAt;
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
  secret: process.env.NEXTAUTH_SECRET,
});