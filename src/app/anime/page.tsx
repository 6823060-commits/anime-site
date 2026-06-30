import { prisma } from "@/lib/prisma";
import { AnimeCard } from "@/components/anime/AnimeCard";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ genre?: string; status?: string; type?: string; page?: string }>;
}

export default async function AnimePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const take = 24;
  const skip = (page - 1) * take;

  const where: any = {};
  if (params.genre) where.genres = { some: { genre: { name: params.genre } } };
  if (params.status) where.status = params.status;
  if (params.type) where.type = params.type;

  const [animes, total, genres] = await Promise.all([
    prisma.anime.findMany({ where, take, skip, orderBy: { createdAt: "desc" }, include: { genres: { include: { genre: true } } } }),
    prisma.anime.count({ where }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / take);

  const buildUrl = (p: Record<string, string>) => {
    const q = new URLSearchParams({ ...params, page: "1", ...p } as any);
    return `/anime?${q}`;
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 className="section-title" style={{ marginBottom: 24 }}>Бүх анимэ</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select className="select" style={{ width: "auto" }} defaultValue={params.status || ""} onChange={e => { window.location.href = buildUrl({ status: e.target.value }); }}>
          <option value="">Бүх төлөв</option>
          <option value="ONGOING">Явж байна</option>
          <option value="COMPLETED">Дууссан</option>
          <option value="UPCOMING">Удахгүй</option>
        </select>
        <select className="select" style={{ width: "auto" }} defaultValue={params.type || ""} onChange={e => { window.location.href = buildUrl({ type: e.target.value }); }}>
          <option value="">Бүх төрөл</option>
          <option value="TV">TV</option>
          <option value="MOVIE">Кино</option>
          <option value="OVA">OVA</option>
          <option value="ONA">ONA</option>
        </select>
      </div>

      {/* Genre tags */}
      <div className="genre-filter">
        <Link href="/anime" className={`genre-tag ${!params.genre ? "active" : ""}`}>Бүгд</Link>
        {genres.map(g => (
          <Link key={g.id} href={buildUrl({ genre: g.name })} className={`genre-tag ${params.genre === g.name ? "active" : ""}`}>{g.name}</Link>
        ))}
      </div>

      {/* Grid */}
      <div className="anime-grid">
        {animes.map(a => <AnimeCard key={a.id} anime={a} />)}
      </div>

      {animes.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Анимэ олдсонгүй</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={buildUrl({ page: String(p) })} className={`page-btn ${p === page ? "active" : ""}`}>{p}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
