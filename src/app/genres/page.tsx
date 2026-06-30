import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GenresPage() {
  const genres = await prisma.genre.findMany({
    include: { _count: { select: { animes: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="section-title">Анимэний төрлүүд</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
        {genres.map(g => (
          <Link key={g.id} href={`/anime?genre=${encodeURIComponent(g.name)}`} className="card" style={{ padding: 24, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{g.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{g._count.animes} анимэ</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
