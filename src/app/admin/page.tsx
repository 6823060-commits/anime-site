import { prisma } from "@/lib/prisma";
import { Film, Users, List, Tag } from "lucide-react";

export default async function AdminDashboard() {
  const [animes, users, episodes, genres] = await Promise.all([
    prisma.anime.count(),
    prisma.user.count(),
    prisma.episode.count(),
    prisma.genre.count(),
  ]);

  const stats = [
    { label: "Нийт анимэ", value: animes, icon: Film, color: "#6c63ff" },
    { label: "Нийт хэрэглэгч", value: users, icon: Users, color: "#22c55e" },
    { label: "Нийт анги", value: episodes, icon: List, color: "#f59e0b" },
    { label: "Нийт төрөл", value: genres, icon: Tag, color: "#ef4444" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Хянах самбар</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{s.value}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
