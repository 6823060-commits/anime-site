import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Play } from "lucide-react";

export default async function HistoryPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const history = await prisma.watchHistory.findMany({
    where: { userId: session.user.id },
    include: { episode: { include: { anime: true } } },
    orderBy: { watchedAt: "desc" },
    take: 50,
  });

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="section-title">Үзсэн түүх</h1>
      {history.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Үзсэн анимэ байхгүй байна.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {history.map(h => (
            <Link key={`${h.episodeId}`} href={`/watch/${h.episode.animeId}?ep=${h.episodeId}`} className="card" style={{ display: "flex", gap: 16, padding: 16, alignItems: "center" }}>
              <img src={h.episode.anime.coverImage || ""} alt={h.episode.anime.title} style={{ width: 64, height: 90, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{h.episode.anime.title}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{h.episode.number}-р анги {h.episode.title ? `— ${h.episode.title}` : ""}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{new Date(h.watchedAt).toLocaleDateString("mn-MN")}</div>
              </div>
              <Play size={20} color="var(--accent)" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
