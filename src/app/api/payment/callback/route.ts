import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanType } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status === "COMPLETED") return NextResponse.json({ ok: true });

  const planData = PLANS.find((p) => p.id === payment.plan)!;
  const expiresAt = new Date(Date.now() + planData.duration * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "COMPLETED", paidAt: new Date() },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { plan: payment.plan as PlanType, planExpiresAt: expiresAt },
    }),
    prisma.subscription.upsert({
      where: { userId: payment.userId },
      update: { plan: payment.plan as PlanType, expiresAt, startedAt: new Date() },
      create: { userId: payment.userId, plan: payment.plan as PlanType, expiresAt },
    }),
  ]);

  return NextResponse.json({ success: true });
}
