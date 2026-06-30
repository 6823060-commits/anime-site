import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/plans";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  });

  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const statusIcon = { COMPLETED: <CheckCircle size={14} color="var(--success)" />, PENDING: <Clock size={14} color="var(--warning)" />, FAILED: <XCircle size={14} color="var(--danger)" />, REFUNDED: <XCircle size={14} color="var(--text-muted)" /> };
  const statusColor = { COMPLETED: "var(--success)", PENDING: "var(--warning)", FAILED: "var(--danger)", REFUNDED: "var(--text-muted)" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Төлбөрүүд</h1>
        <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 20px", textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>Нийт орлого</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--success)" }}>{formatPrice(totalRevenue)}</div>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Хэрэглэгч</th>
              <th>Төлөвлөгөө</th>
              <th>Дүн</th>
              <th>Арга</th>
              <th>Төлөв</th>
              <th>Нэхэмжлэл</th>
              <th>Огноо</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{p.user.name || "—"}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.user.email}</div>
                </td>
                <td>
                  <span className={`plan-pill plan-pill-${p.plan.toLowerCase()}`}>{p.plan}</span>
                </td>
                <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatPrice(p.amount)}</td>
                <td style={{ fontSize: 12 }}>{p.method}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: statusColor[p.status as keyof typeof statusColor] }}>
                    {statusIcon[p.status as keyof typeof statusIcon]}
                    {p.status}
                  </div>
                </td>
                <td style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {p.invoiceId || "—"}
                </td>
                <td style={{ fontSize: 12 }}>{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>Төлбөр байхгүй</div>
        )}
      </div>
    </div>
  );
}
