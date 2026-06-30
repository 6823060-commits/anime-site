import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Play, Star, Calendar, Film, Heart } from "lucide-react";
import { FavoriteButton } from "@/components/anime/FavoriteButton";

interface Props { params: Promise<{ id: string }> }

const statusMap: Record<string, { label: string; cls: string }> = {
  ONGOING: { label: "Явж байна", cls: "badge-ongoing" },
  COMPLETED: { label: "Дууссан", cls: "badge-completed" },
  UPCOMING: { label: "Удахгүй", cls: "badge-upcoming" },
};

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const anime = await prisma.anime.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      episodes: { orderBy: { number: "asc" } },
    },
  });

  if (!anime) notFound();

  let isFav = false;
  if (session?.user?.id) {
    const fav = await prisma.favorite.findUnique({ where: { userId_animeId: { userId: session.user.id, animeId: id } } });
    isFav = !!fav;
  }

  const status = statusMap[anime.status] || statusMap.COMPLETED;
  const firstEp = anime.episodes[0];

  return (
    <div>
      {/* Banner */}
      <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${anime.bannerImage || anime.coverImage || ""})`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.3)"
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)" }} />
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div style={{ display: "flex", gap: 32, marginTop: -100, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          {/* Cover */}
          <img
            src={anime.coverImage || "https://via.placeholder.com/200x300/16161f/6c63ff?text=Анимэ"}
            alt={anime.title}
            style={{ width: 200, borderRadius: 12, flexShrink: 0, border: "3px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          />

          {/* Info */}
          <div style={{ flex: 1, paddingTop: 80 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className={`badge ${status.cls}`}>{status.label}</span>
              {anime.genres.map(g => <span key={g.genreId} style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg-card)", padding: "2px 10px", borderRadius: 20, border: "1px solid var(--border)" }}>{g.genre.name}</span>)}
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{anime.title}</h1>
            {anime.titleEn && <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 16 }}>{anime.titleEn}</p>}

            <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
              {anime.rating && <div className="rating"><Star size={15} fill="currentColor" /> <strong>{anime.rating.toFixed(1)}</strong></div>}
              {anime.year && <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14, color: "var(--text-secondary)" }}><Calendar size={14}/>{anime.year}</div>}
              <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14, color: "var(--text-secondary)" }}><Film size={14}/>{anime.type}</div>
              {anime.totalEps && <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>{anime.totalEps} анги</div>}
            </div>

            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24, maxWidth: 600 }}>{anime.description}</p>

            <div style={{ display: "flex", gap: 12 }}>
              {firstEp && (
                <Link href={`/watch/${anime.id}?ep=${firstEp.id}`} className="btn btn-primary btn-lg">
                  <Play size={18} fill="currentColor" /> Эхний анги үзэх
                </Link>
              )}
              {session && <FavoriteButton animeId={id} isFav={isFav} />}
            </div>
          </div>
        </div>

        {/* Episodes */}
        <div className="section">
          <h2 className="section-title">Ангиуд ({anime.episodes.length})</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {anime.episodes.map(ep => (
              <Link key={ep.id} href={`/watch/${anime.id}?ep=${ep.id}`} className="episode-item">
                <div className="episode-num">{ep.number}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{ep.title || `${ep.number}-р анги`}</div>
                  {ep.duration && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{Math.floor(ep.duration / 60)} мин</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
