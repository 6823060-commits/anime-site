import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Film, List, Tag, Users, CreditCard } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== "ADMIN" && role !== "EDITOR")) redirect("/");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, padding: "0 14px" }}>
          Удирдах хэсэг
        </div>
        {role === "ADMIN" && (
          <Link href="/admin" className="admin-nav-item"><LayoutDashboard size={16} /> Хянах самбар</Link>
        )}
        <Link href="/admin/anime" className="admin-nav-item"><Film size={16} /> Анимэ</Link>
        {role === "ADMIN" && (
          <Link href="/admin/genres" className="admin-nav-item"><Tag size={16} /> Төрлүүд</Link>
        )}
        <Link href="/admin/episodes" className="admin-nav-item"><List size={16} /> Ангиуд</Link>
        {role === "ADMIN" && <>
          <Link href="/admin/users" className="admin-nav-item"><Users size={16} /> Хэрэглэгчид</Link>
          <Link href="/admin/payments" className="admin-nav-item"><CreditCard size={16} /> Төлбөрүүд</Link>
        </>}
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
