import { prisma } from "@/lib/prisma";
import { EpisodeForm } from "@/components/admin/EpisodeForm";
import { DeleteEpisodeButton } from "@/components/admin/DeleteEpisodeButton";
import { Pencil } from "lucide-react";

export default async function AdminEpisodesPage() {
  const [episodes, animes] = await Promise.all([
    prisma.episode.findMany({ orderBy: [{ anime: { title: "asc" } }, { number: "asc" }], include: { anime: { select: { title: true } } }, take: 100 }),
    prisma.anime.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Ангиуд удирдах</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Шинэ анги нэмэх</h2>
          <EpisodeForm animes={animes} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Бүх ангиуд</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="table">
              <thead><tr><th>Анимэ</th><th>#</th><th>Гарчиг</th><th></th></tr></thead>
              <tbody>
                {episodes.map(ep => (
                  <tr key={ep.id}>
                    <td style={{ fontSize: 12 }}>{ep.anime.title}</td>
                    <td>{ep.number}</td>
                    <td style={{ fontSize: 13 }}>{ep.title || "—"}</td>
                    <td><DeleteEpisodeButton id={ep.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
