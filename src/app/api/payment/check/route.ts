import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanType } from "@/lib/plans";

async function checkQPayInvoice(invoiceId: string): Promise<boolean> {
  try {
    const authRes = await fetch(`${process.env.QPAY_URL || "https://merchant.qpay.mn/v2"}/auth/token`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${process.env.QPAY_USERNAME || "TEST_MERCHANT"}:${process.env.QPAY_PASSWORD || "123456"}`).toString("base64"),
      },
    });
    if (!authRes.ok) return false;
    const { access_token } = await authRes.json();

    const payRes = await fetch(`${process.env.QPAY_URL || "https://merchant.qpay.mn/v2"}/payment/check`, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ object_type: "INVOICE", object_id: invoiceId }),
    });
    if (!payRes.ok) return false;
    const payData = await payRes.json();
    return payData.paid_amount > 0 || payData.rows?.some((r: any) => r.payment_status === "PAID");
  } catch {
    return false;
  }
}

async function activatePlan(userId: string, plan: PlanType, paymentId: string) {
  const planData = PLANS.find((p) => p.id === plan)!;
  const expiresAt = new Date(Date.now() + planData.duration * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "COMPLETED", paidAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt: expiresAt },
    }),
    prisma.subscription.upsert({
      where: { userId },
      update: { plan, expiresAt, startedAt: new Date() },
      create: { userId, plan, expiresAt },
    }),
  ]);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const paymentId = req.nextUrl.searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "paymentId шаардлагатай" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (payment.status === "COMPLETED") {
    return NextResponse.json({ paid: true });
  }

  // Try real QPay check
  if (payment.invoiceId && !payment.invoiceId.startsWith("INV-")) {
    const paid = await checkQPayInvoice(payment.invoiceId);
    if (paid) {
      await activatePlan(session.user.id, payment.plan, payment.id);
      return NextResponse.json({ paid: true });
    }
  }

  // ── DEMO MODE: auto-confirm after 5 seconds ──────────────
  // In production, remove this block and rely on real QPay
  const createdAt = new Date(payment.createdAt).getTime();
  const elapsed = Date.now() - createdAt;
  if (elapsed > 5000) {
    await activatePlan(session.user.id, payment.plan, payment.id);
    return NextResponse.json({ paid: true, demo: true });
  }

  return NextResponse.json({ paid: false });
}
