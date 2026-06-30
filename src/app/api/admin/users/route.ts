import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId, role } = await req.json();
  if (!["USER", "EDITOR", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Буруу эрх" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json({ ok: true });
}
