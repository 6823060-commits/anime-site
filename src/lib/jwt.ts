import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret-change-me";

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES_DAYS = 30;

export function signAccessToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function createRefreshToken(userId: string, userAgent?: string, ipAddress?: string) {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, token, expiresAt, userAgent, ipAddress },
  });

  return token;
}

export async function verifyRefreshToken(token: string) {
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (!record || record.revoked || new Date() > record.expiresAt) return null;
  return record;
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
}

export async function revokeAllUserTokens(userId: string) {
  await prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
}