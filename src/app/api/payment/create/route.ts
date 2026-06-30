import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, PlanType } from "@/lib/plans";

// QPay sandbox credentials — replace with real ones in production
const QPAY_URL = process.env.QPAY_URL || "https://merchant.qpay.mn/v2";
const QPAY_USERNAME = process.env.QPAY_USERNAME || "TEST_MERCHANT";
const QPAY_PASSWORD = process.env.QPAY_PASSWORD || "123456";
const QPAY_INVOICE_CODE = process.env.QPAY_INVOICE_CODE || "TEST_INVOICE";

async function getQPayToken(): Promise<string | null> {
  try {
    const res = await fetch(`${QPAY_URL}/auth/token`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${QPAY_USERNAME}:${QPAY_PASSWORD}`).toString("base64"),
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token;
  } catch {
    return null;
  }
}

async function createQPayInvoice(token: string, paymentId: string, amount: number, description: string) {
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payment/callback?paymentId=${paymentId}`;
  const res = await fetch(`${QPAY_URL}/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: QPAY_INVOICE_CODE,
      sender_invoice_no: paymentId,
      invoice_receiver_code: "terminal",
      invoice_description: description,
      amount,
      callback_url: callbackUrl,
    }),
  });
  if (!res.ok) throw new Error("QPay invoice failed");
  return res.json();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Нэвтэрнэ үү" }, { status: 401 });

  const { plan, method } = await req.json();
  const planData = PLANS.find((p) => p.id === plan);
  if (!planData || planData.price === 0) return NextResponse.json({ error: "Буруу төлөвлөгөө" }, { status: 400 });

  // Create pending payment record
  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      plan: plan as PlanType,
      amount: planData.price,
      method: method || "QPAY",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    },
  });

  // Try QPay
  if (method === "QPAY") {
    try {
      const token = await getQPayToken();
      if (token) {
        const invoice = await createQPayInvoice(
          token,
          payment.id,
          planData.price,
          `АнимэMN ${planData.name} эрх`
        );
        const qrCode = invoice.qr_image || "";
        const invoiceId = invoice.invoice_id || payment.id;

        await prisma.payment.update({
          where: { id: payment.id },
          data: { invoiceId: invoiceId.toString(), qrCode },
        });

        return NextResponse.json({ paymentId: payment.id, invoiceId, qrCode });
      }
    } catch {
      // QPay failed — fall through to mock
    }
  }

  // ── DEMO MODE (no real QPay creds) ──────────────────────
  // Generate a fake QR code using a public QR API
  const mockInvoiceId = `INV-${payment.id.slice(0, 8).toUpperCase()}`;
  const qrText = `QPAY:${mockInvoiceId}:${planData.price}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}&format=png`;

  // Fetch QR image as base64
  let qrBase64 = "";
  try {
    const qrRes = await fetch(qrUrl);
    const buf = await qrRes.arrayBuffer();
    qrBase64 = Buffer.from(buf).toString("base64");
  } catch {
    qrBase64 = "";
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { invoiceId: mockInvoiceId, qrCode: qrBase64 },
  });

  return NextResponse.json({ paymentId: payment.id, invoiceId: mockInvoiceId, qrCode: qrBase64 });
}
