import { prisma } from "./prisma";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 20 * 60 * 1000; // 20 min

export async function recordFailedAttempt(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { failedAttempts: { increment: 1 } },
  });

  if (user.failedAttempts >= MAX_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: new Date(Date.now() + LOCK_DURATION_MS) },
    });
  }
}

export async function resetFailedAttempts(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { failedAttempts: 0, lockedUntil: null },
  });
}

export function isLocked(lockedUntil: Date | null): boolean {
  return !!lockedUntil && new Date() < new Date(lockedUntil);
}

export function lockRemainingMinutes(lockedUntil: Date | null): number {
  if (!lockedUntil) return 0;
  const ms = new Date(lockedUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 60000));
}