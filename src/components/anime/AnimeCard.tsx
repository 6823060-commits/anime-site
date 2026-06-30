import Link from "next/link";
import { Star } from "lucide-react";

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
    <Link href={`/anime/${anime.id}`} className="card anime-card">
      <div style={{ position: "relative" }}>
        <img
          src={anime.coverImage || "https://via.placeholder.com/200x300/16161f/6c63ff?text=Анимэ"}
          alt={anime.title}
        />
        <span className={`badge ${status.cls}`} style={{ position: "absolute", top: 8, left: 8 }}>{status.label}</span>
        {anime.totalEps && (
          <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.75)", padding: "2px 8px", borderRadius: 4, fontSize: 11, color: "#fff" }}>
            {anime.totalEps} анги
          </span>
        )}
      </div>
      <div className="anime-card-info">
        <div className="anime-card-title">{anime.title}</div>
        <div className="anime-card-meta">
          {anime.rating ? (
            <span className="rating"><Star size={11} fill="currentColor" />{anime.rating.toFixed(1)}</span>
          ) : null}
          <span>{anime.type}</span>
        </div>
      </div>
    </Link>
  );
}
