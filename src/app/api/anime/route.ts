import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function adminGuard() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return false;
  return true;
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, titleEn, description, coverImage, bannerImage, status, type, year, season, rating, totalEps, genreIds } = await req.json();
  const anime = await prisma.anime.create({
    data: {
      title, titleEn, description, coverImage, bannerImage, status, type, year, season, rating, totalEps,
      genres: genreIds?.length ? { create: genreIds.map((id: string) => ({ genreId: id })) } : undefined,
    },
  });
  return NextResponse.json(anime);
}
