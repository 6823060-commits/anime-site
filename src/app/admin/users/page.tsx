import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, isPremiumActive } from "@/lib/plans";
import { UserRoleButton } from "@/components/admin/UserRoleButton";
import { Crown, Shield, User } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { payments: true, favorites: true } } },
  });

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Хэрэглэгчид ({users.length})</h1>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Нэр / Имэйл</th>
              <th>Эрх</th>
              <th>Төлөвлөгөө</th>
              <th>Дуусах огноо</th>
              <th>Төлбөр</th>
              <th>Бүртгэсэн</th>
              <th>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const active = isPremiumActive(u.planExpiresAt, u.plan as any);
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === "ADMIN" ? "badge-admin" : u.role === "EDITOR" ? "badge-editor" : "badge-free"}`}>
                      {u.role === "ADMIN" ? <Shield size={10} /> : u.role === "EDITOR" ? "✏️" : <User size={10} />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`plan-pill plan-pill-${u.plan.toLowerCase()}`}>
                      {u.plan === "PREMIUM" ? <Crown size={10} /> : null}
                      {u.plan}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {u.planExpiresAt ? (
                      <span style={{ color: active ? "var(--success)" : "var(--danger)" }}>
                        {formatDate(u.planExpiresAt)}
                        {!active && " (дууссан)"}
                      </span>
                    ) : "—"}
                  </td>
                  <td>{u._count.payments}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <UserRoleButton userId={u.id} currentRole={u.role} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
