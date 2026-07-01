import { prisma } from "@/lib/prisma";
import { AnimeCard } from "@/components/anime/AnimeCard";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    genre?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function AnimePage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page || 1);
  const take = 24;
  const skip = (page - 1) * take;

  const where: any = {};

  if (params.genre) {
    where.genres = {
      some: {
        genre: {
          name: params.genre,
        },
      },
    };
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.type) {
    where.type = params.type;
  }

  const [animes, total, genres] = await Promise.all([
    prisma.anime.findMany({
      where,
      take,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    }),
    prisma.anime.count({ where }),
    prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const totalPages = Math.ceil(total / take);

  const buildUrl = (p: Record<string, string>) => {
    const q = new URLSearchParams();

    if (params.genre) q.set("genre", params.genre);
    if (params.status) q.set("status", params.status);
    if (params.type) q.set("type", params.type);

    Object.entries(p).forEach(([key, value]) => {
      if (value) {
        q.set(key, value);
      } else {
        q.delete(key);
      }
    });

    q.set("page", "1");

    return `/anime?${q.toString()}`;
  };

  const buildPageUrl = (pageNumber: number) => {
    const q = new URLSearchParams();

    if (params.genre) q.set("genre", params.genre);
    if (params.status) q.set("status", params.status);
    if (params.type) q.set("type", params.type);

    q.set("page", String(pageNumber));

    return `/anime?${q.toString()}`;
  };

  return (
    <main className="container py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Бүх анимэ</h1>
          <p className="mt-2 text-sm text-white/60">
            Нийт {total} анимэ байна
          </p>
        </div>

        <form method="GET" action="/anime" className="flex flex-wrap gap-3">
          {params.genre ? (
            <input type="hidden" name="genre" value={params.genre} />
          ) : null}

          <select
            name="status"
            className="select"
            defaultValue={params.status || ""}
          >
            <option value="">Бүх төлөв</option>
            <option value="ONGOING">Явж байна</option>
            <option value="COMPLETED">Дууссан</option>
            <option value="UPCOMING">Удахгүй</option>
          </select>

          <select
            name="type"
            className="select"
            defaultValue={params.type || ""}
          >
            <option value="">Бүх төрөл</option>
            <option value="TV">TV</option>
            <option value="MOVIE">Кино</option>
            <option value="OVA">OVA</option>
            <option value="ONA">ONA</option>
            <option value="SPECIAL">Special</option>
          </select>

          <button type="submit" className="btn btn-primary">
            Шүүх
          </button>

          {(params.genre || params.status || params.type) && (
            <Link href="/anime" className="btn btn-secondary">
              Цэвэрлэх
            </Link>
          )}
        </form>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={buildUrl({ genre: "" })}
          className={`badge ${!params.genre ? "badge-primary" : ""}`}
        >
          Бүгд
        </Link>

        {genres.map((g) => (
          <Link
            key={g.id}
            href={buildUrl({ genre: g.name })}
            className={`badge ${params.genre === g.name ? "badge-primary" : ""}`}
          >
            {g.name}
          </Link>
        ))}
      </div>

      {animes.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {animes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-lg font-semibold">Анимэ олдсонгүй</p>
          <p className="mt-2 text-sm text-white/60">
            Өөр шүүлтүүр сонгоод дахин оролдоно уу.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildPageUrl(p)}
              className={`btn ${p === page ? "btn-primary" : "btn-secondary"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}