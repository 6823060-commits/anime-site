import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function adminGuard() {
  const session = await auth();
  return session && (session.user as any)?.role === "ADMIN";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { title, titleEn, description, coverImage, bannerImage, status, type, year, season, rating, totalEps, genreIds } = await req.json();
  await prisma.animeGenre.deleteMany({ where: { animeId: id } });
  const anime = await prisma.anime.update({
    where: { id },
    data: {
      title, titleEn, description, coverImage, bannerImage, status, type, year, season, rating, totalEps,
      genres: genreIds?.length ? { create: genreIds.map((gid: string) => ({ genreId: gid })) } : undefined,
    },
  });
  return NextResponse.json(anime);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.anime.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
