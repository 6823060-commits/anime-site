import { prisma } from "@/lib/prisma";
import { AnimeForm } from "@/components/admin/AnimeForm";

export default async function NewAnimePage() {
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Шинэ анимэ нэмэх</h1>
      <AnimeForm genres={genres} />
    </div>
  );
}
