import { prisma } from "@/lib/prisma";
import { GenreManager } from "@/components/admin/GenreManager";

export default async function AdminGenresPage() {
  const genres = await prisma.genre.findMany({ include: { _count: { select: { animes: true } } }, orderBy: { name: "asc" } });
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Төрлүүд удирдах</h1>
      <GenreManager genres={genres.map(g => ({ id: g.id, name: g.name, count: g._count.animes }))} />
    </div>
  );
}
