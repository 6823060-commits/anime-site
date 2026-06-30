"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserRoleButton({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const change = async (role: string) => {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <select
      className="select"
      style={{ width: "auto", fontSize: 12, padding: "4px 8px" }}
      value={currentRole}
      onChange={(e) => change(e.target.value)}
      disabled={loading}
    >
      <option value="USER">USER</option>
      <option value="EDITOR">EDITOR</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
