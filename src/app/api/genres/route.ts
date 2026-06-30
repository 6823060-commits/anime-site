import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function adminGuard() {
  const session = await auth();
  return session && (session.user as any)?.role === "ADMIN";
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  try {
    const g = await prisma.genre.create({ data: { name } });
    return NextResponse.json(g);
  } catch {
    return NextResponse.json({ error: "Ийм нэртэй төрөл аль хэдийн байна." }, { status: 400 });
  }
}
