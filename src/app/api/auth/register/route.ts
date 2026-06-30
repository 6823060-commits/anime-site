import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "Бүх талбарыг бөглөнө үү." }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Имэйл бүртгэлтэй байна." }, { status: 400 });
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { name, email, password: hashed } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Серверийн алдаа." }, { status: 500 });
  }
}
