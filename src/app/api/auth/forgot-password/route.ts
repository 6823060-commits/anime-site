import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createEmailOtp } from "@/lib/otp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Хэт олон хүсэлт. Түр хүлээнэ үү." }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Имэйл оруулна уу." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Энэ имэйлээр бүртгэл олдсонгүй." }, { status: 404 });

    await createEmailOtp(user.id, email);

    // userId-г client-д илгээхгүй, зөвхөн email ашиглана
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    return NextResponse.json({ error: "Серверийн алдаа." }, { status: 500 });
  }
}