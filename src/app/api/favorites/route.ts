import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { animeId } = await req.json();
  await prisma.favorite.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId } },
    update: {},
    create: { userId: session.user.id, animeId },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { animeId } = await req.json();
  await prisma.favorite.deleteMany({ where: { userId: session.user.id, animeId } });
  return NextResponse.json({ ok: true });
}
