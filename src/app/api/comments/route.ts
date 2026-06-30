import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { episodeId, content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Сэтгэгдэл хоосон байна." }, { status: 400 });
  const comment = await prisma.comment.create({
    data: { userId: session.user.id, episodeId, content },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ ...comment, createdAt: comment.createdAt.toISOString() });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isAdmin = (session.user as any).role === "ADMIN";
  if (comment.userId !== session.user.id && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
