import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function editorGuard() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  return session && (role === "ADMIN" || role === "EDITOR");
}

export async function POST(req: NextRequest) {
  if (!await editorGuard()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { animeId, number, title, description, videoUrl, duration, thumbnail, isPremium, requiredPlan } = await req.json();
  try {
    const ep = await prisma.episode.create({
      data: {
        animeId, number, title, description, videoUrl, duration, thumbnail,
        isPremium: isPremium || false,
        requiredPlan: isPremium ? (requiredPlan || "BASIC") : "FREE",
      },
    });
    return NextResponse.json(ep);
  } catch {
    return NextResponse.json({ error: "Тэр дугаарт анги аль хэдийн байна." }, { status: 400 });
  }
}
