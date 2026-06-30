import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Play, Star, TrendingUp, Clock } from "lucide-react";
import { AnimeCard } from "@/components/anime/AnimeCard";

export default async function HomePage() {
  const [featured, recent, topRated] = await Promise.all([
    prisma.anime.findFirst({ include: { genres: { include: { genre: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.anime.findMany({ take: 12, orderBy: { createdAt: "desc" }, include: { genres: { include: { genre: true } } } }),
    prisma.anime.findMany({ take: 6, orderBy: { rating: "desc" }, include: { genres: { include: { genre: true } } } }),
  ]);

  return (
    <div>
      {/* Hero */}
      {featured && (
        <div className="hero">
          <div className="hero-bg" style={{ backgroundImage: `url(${featured.coverImage || "/placeholder.jpg"})` }} />
          <div className="hero-gradient" />
          <div className="hero-content container">
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {featured.genres.slice(0, 3).map(g => (
                <span key={g.genreId} className="badge badge-completed">{g.genre.name}</span>
              ))}
              {featured.status === "ONGOING" && <span className="badge badge-ongoing">Явж байна</span>}
            </div>
            <h1 className="hero-title">{featured.title}</h1>
            <p className="hero-desc">{featured.description}</p>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href={`/anime/${featured.id}`} className="btn btn-primary btn-lg">
                <Play size={18} fill="currentColor" /> Үзэх
              </Link>
              <Link href={`/anime/${featured.id}`} className="btn btn-secondary btn-lg">
                Дэлгэрэнгүй
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {/* Top Rated */}
        <div className="section">
          <h2 className="section-title"><Star size={20} /> Шилдэг анимэ</h2>
          <div className="anime-grid">
            {topRated.map(a => <AnimeCard key={a.id} anime={a} />)}
          </div>
        </div>

        {/* Recent */}
        <div className="section">
          <h2 className="section-title"><Clock size={20} /> Сүүлд нэмэгдсэн</h2>
          <div className="anime-grid">
            {recent.map(a => <AnimeCard key={a.id} anime={a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
