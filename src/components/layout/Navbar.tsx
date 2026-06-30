"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Search, LogOut, Settings, Heart, History, Crown, CreditCard } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [menu, setMenu] = useState(false);
  const user = session?.user as any;
  const isPremium = user?.plan && user.plan !== "FREE";

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo">アニメMN</Link>
        <div className="navbar-links">
          <Link href="/" className="navbar-link">Нүүр</Link>
          <Link href="/anime" className="navbar-link">Анимэ</Link>
          <Link href="/genres" className="navbar-link">Төрөл</Link>
          <Link href="/premium" className="navbar-link" style={{ color: "var(--gold)", display: "flex", alignItems: "center", gap: 4 }}>
            <Crown size={13} /> Premium
          </Link>
        </div>
        <div className="navbar-actions">
          <Link href="/search" className="btn btn-secondary btn-sm">
            <Search size={15} /> Хайх
          </Link>
          {session ? (
            <div style={{ position: "relative" }}>
              <button
                className={`avatar ${isPremium ? "avatar-premium" : ""}`}
                onClick={() => setMenu(!menu)}
                title={user?.plan || "FREE"}
              >
                {isPremium ? <Crown size={14} /> : session.user?.name?.[0]?.toUpperCase() || "U"}
              </button>
              {menu && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: 8, minWidth: 200, zIndex: 999,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                }}>
                  <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid var(--border)", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{session.user?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{session.user?.email}</div>
                    <span className={`plan-pill plan-pill-${(user?.plan || "free").toLowerCase()}`}>
                      {user?.plan === "PREMIUM" && <Crown size={10} />}
                      {user?.plan || "FREE"}
                    </span>
                  </div>
                  <Link href="/favorites" className="admin-nav-item" onClick={() => setMenu(false)}><Heart size={14} /> Дуртай анимэ</Link>
                  <Link href="/history" className="admin-nav-item" onClick={() => setMenu(false)}><History size={14} /> Үзсэн түүх</Link>
                  <Link href="/premium" className="admin-nav-item" onClick={() => setMenu(false)} style={{ color: "var(--gold)" }}><Crown size={14} /> Premium</Link>
                  {(user?.role === "ADMIN" || user?.role === "EDITOR") && (
                    <Link href="/admin" className="admin-nav-item" onClick={() => setMenu(false)}><Settings size={14} /> Удирдах хэсэг</Link>
                  )}
                  <button className="admin-nav-item" style={{ color: "var(--danger)" }} onClick={() => { signOut(); setMenu(false); }}>
                    <LogOut size={14} /> Гарах
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary btn-sm">Нэвтрэх</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">Бүртгүүлэх</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
