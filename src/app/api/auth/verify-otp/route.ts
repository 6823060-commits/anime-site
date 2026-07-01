import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkEmailOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Бүх талбарыг бөглөнө үү." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Хэрэглэгч олдсонгүй." },
        { status: 404 }
      );
    }

    const result = await checkEmailOtp(user.id, email, code);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);

    return NextResponse.json(
      { error: "Серверийн алдаа." },
      { status: 500 }
    );
  }
}