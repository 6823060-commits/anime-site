import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-policy";  // ← нэмэх
import { rateLimit, getClientIp } from "@/lib/rate-limit";  // ← нэмэх

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Хэт олон бүртгэлийн оролдлого. Дараа дахин оролдоно уу." }, { status: 429 });
    }

    const { name, email, phone, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "Бүх талбарыг бөглөнө үү." }, { status: 400 });

    // Password policy шалгах
    const check = validatePassword(password);
    if (!check.valid) return NextResponse.json({ error: check.errors.join(" ") }, { status: 400 });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Имэйл бүртгэлтэй байна." }, { status: 400 });

    if (phone) {
      const phoneExists = await prisma.user.findUnique({ where: { phone } });
      if (phoneExists) return NextResponse.json({ error: "Утасны дугаар бүртгэлтэй байна." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { name, email, phone, password: hashed } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Серверийн алдаа." }, { status: 500 });
  }
}