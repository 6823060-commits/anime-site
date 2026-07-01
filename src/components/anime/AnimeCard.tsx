import Link from "next/link";
import { Play, Star } from "lucide-react";

interface Props {
  anime: {
    id: string;
    title: string;
    coverImage: string | null;
    status: string;
    rating: number | null;
    totalEps: number | null;
    type: string;
    genres: { genre: { name: string } }[];
  };
}

const statusMap: Record<string, { label: string; cls: string }> = {
  ONGOING: { label: "Явж байна", cls: "badge-ongoing" },
  COMPLETED: { label: "Дууссан", cls: "badge-completed" },
  UPCOMING: { label: "Удахгүй", cls: "badge-upcoming" },
};

export function AnimeCard({ anime }: Props) {
  const status = statusMap[anime.status] || statusMap.COMPLETED;

  return (
    <Link href={`/anime/${anime.id}`} className="anime-card card">
      <div className="anime-cover-wrap">
        <img
          src={anime.coverImage || "/placeholder-cover.jpg"}
          alt={anime.title}
          className="anime-cover"
        />

        <div className="anime-card-shade" />

        <div className="anime-play">
          <Play size={20} fill="currentColor" />
        </div>

        <div className="anime-card-top">
          <span className={`badge ${status.cls}`}>{status.label}</span>
        </div>

        {anime.totalEps ? (
          <span className="episode-badge">{anime.totalEps} анги</span>
        ) : null}
      </div>

      <div className="anime-card-info">
        <h3 className="anime-card-title">{anime.title}</h3>

        <div className="anime-card-genres">
          {anime.genres.slice(0, 2).map((item) => (
            <span key={item.genre.name}>{item.genre.name}</span>
          ))}
        </div>

        <div className="anime-card-meta">
          {anime.rating ? (
            <span className="rating">
              <Star size={13} fill="currentColor" />
              {anime.rating.toFixed(1)}
            </span>
          ) : (
            <span>Шинэ</span>
          )}

          <span>{anime.type}</span>
        </div>
      </div>
    </Link>
  );
}