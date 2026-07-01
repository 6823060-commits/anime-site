"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FormEvent, useState } from "react";
import {
  Clapperboard,
  Crown,
  Heart,
  History,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type UserLike = {
  name?: string | null;
  email?: string | null;
  role?: string;
  plan?: string;
};

const navItems = [
  { href: "/", label: "Нүүр", icon: Home },
  { href: "/anime", label: "Анимэ", icon: Clapperboard },
  { href: "/genres", label: "Төрөл", icon: Sparkles },
  { href: "/premium", label: "Premium", icon: Crown },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");

  const user = session?.user as UserLike | undefined;
  const isPremium = user?.plan && user.plan !== "FREE";
  const isAdmin = user?.role === "ADMIN" || user?.role === "EDITOR";

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const q = query.trim();
    if (!q) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-mark">A</span>
          <span>АнимэМН</span>
        </Link>

        <nav className="navbar-links desktop-only">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`navbar-link ${active ? "active" : ""}`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={handleSearch} className="nav-search desktop-only">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Анимэ хайх..."
          />
        </form>

        <div className="navbar-actions">
          <ThemeToggle />

          {session ? (
            <div className="profile-wrap">
              <button
                type="button"
                className={`avatar ${isPremium ? "avatar-premium" : ""}`}
                onClick={() => setProfileOpen((value) => !value)}
                title={user?.plan || "FREE"}
              >
                {isPremium ? <Crown size={17} /> : user?.name?.[0]?.toUpperCase() || "U"}
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-head">
                    <div className="profile-icon">
                      <User size={18} />
                    </div>
                    <div>
                      <p>{user?.name || "Хэрэглэгч"}</p>
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  <div className={`plan-pill plan-pill-${(user?.plan || "free").toLowerCase()}`}>
                    {user?.plan === "PREMIUM" && <Crown size={13} />}
                    {user?.plan || "FREE"}
                  </div>

                  <Link
                    href="/favorites"
                    className="profile-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Heart size={16} />
                    Дуртай анимэ
                  </Link>

                  <Link
                    href="/history"
                    className="profile-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <History size={16} />
                    Үзсэн түүх
                  </Link>

                  <Link
                    href="/premium"
                    className="profile-link premium-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Crown size={16} />
                    Premium авах
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="profile-link"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings size={16} />
                      Удирдах хэсэг
                    </Link>
                  )}

                  <button
                    type="button"
                    className="profile-link logout-link"
                    onClick={() => {
                      signOut();
                      setProfileOpen(false);
                    }}
                  >
                    <LogOut size={16} />
                    Гарах
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions desktop-only">
              <Link href="/auth/login" className="btn btn-secondary btn-sm">
                Нэвтрэх
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                Бүртгүүлэх
              </Link>
            </div>
          )}

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch} className="nav-search mobile-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Анимэ хайх..."
            />
          </form>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-link ${active ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}

          {!session && (
            <div className="mobile-auth">
              <Link
                href="/auth/login"
                className="btn btn-secondary"
                onClick={() => setMenuOpen(false)}
              >
                Нэвтрэх
              </Link>
              <Link
                href="/auth/register"
                className="btn btn-primary"
                onClick={() => setMenuOpen(false)}
              >
                Бүртгүүлэх
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}