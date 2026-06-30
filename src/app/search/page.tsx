import { prisma } from "@/lib/prisma";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { SearchInput } from "@/components/anime/SearchInput";

interface Props { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const animes = q ? await prisma.anime.findMany({
    where: { OR: [{ title: { contains: q, mode: "insensitive" } }, { titleEn: { contains: q, mode: "insensitive" } }] },
    include: { genres: { include: { genre: true } } },
    take: 48,
  }) : [];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Хайлт</h1>
      <SearchInput initialQ={q || ""} />
      {q && (
        <div style={{ marginTop: 24 }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
            &ldquo;<strong style={{ color: "var(--text-primary)" }}>{q}</strong>&rdquo; хайлтын үр дүн: {animes.length} анимэ
          </p>
          {animes.length > 0 ? (
            <div className="anime-grid">{animes.map(a => <AnimeCard key={a.id} anime={a} />)}</div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Анимэ олдсонгүй</div>
          )}
        </div>
      )}
    </div>
  );
}
