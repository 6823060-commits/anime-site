import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-policy";
import { verifyEmailOtp } from "@/lib/otp";
import { revokeAllUserTokens } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Бүх талбарыг бөглөнө үү." }, { status: 400 });
    }

    const check = validatePassword(newPassword);
    if (!check.valid) return NextResponse.json({ error: check.errors.join(" ") }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Хэрэглэгч олдсонгүй." }, { status: 404 });

    const result = await verifyEmailOtp(user.id, email, code);
    if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, failedAttempts: 0, lockedUntil: null },
    });

    await revokeAllUserTokens(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    return NextResponse.json({ error: "Серверийн алдаа." }, { status: 500 });
  }
}