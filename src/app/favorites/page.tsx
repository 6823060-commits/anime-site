import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnimeCard } from "@/components/anime/AnimeCard";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const favs = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { anime: { include: { genres: { include: { genre: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="section-title">Дуртай анимэ ({favs.length})</h1>
      {favs.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Дуртай анимэ байхгүй байна.</p>
      ) : (
        <div className="anime-grid">{favs.map(f => <AnimeCard key={f.animeId} anime={f.anime} />)}</div>
      )}
    </div>
  );
}
