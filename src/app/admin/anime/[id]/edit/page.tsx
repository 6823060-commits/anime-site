import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AnimeForm } from "@/components/admin/AnimeForm";

interface Props { params: Promise<{ id: string }> }

export default async function EditAnimePage({ params }: Props) {
  const { id } = await params;
  const [anime, genres] = await Promise.all([
    prisma.anime.findUnique({ where: { id }, include: { genres: true } }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!anime) notFound();
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Анимэ засах: {anime.title}</h1>
      <AnimeForm genres={genres} anime={{ ...anime, rating: anime.rating ?? undefined, genreIds: anime.genres.map(g => g.genreId) }} />
    </div>
  );
}
