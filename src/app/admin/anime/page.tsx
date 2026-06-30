import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteAnimeButton } from "@/components/admin/DeleteAnimeButton";

export default async function AdminAnimePage() {
  const animes = await prisma.anime.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { episodes: true } } } });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Анимэ удирдах</h1>
        <Link href="/admin/anime/new" className="btn btn-primary"><Plus size={16}/> Шинэ анимэ</Link>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>Нэр</th><th>Төлөв</th><th>Төрөл</th><th>Анги</th><th>Оноо</th><th>Үйлдэл</th></tr></thead>
          <tbody>
            {animes.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{a.title}</td>
                <td><span className={`badge ${a.status === "ONGOING" ? "badge-ongoing" : a.status === "COMPLETED" ? "badge-completed" : "badge-upcoming"}`}>{a.status}</span></td>
                <td>{a.type}</td>
                <td>{a._count.episodes}</td>
                <td>{a.rating?.toFixed(1) || "—"}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <Link href={`/admin/anime/${a.id}/edit`} className="btn btn-secondary btn-sm"><Pencil size={13}/></Link>
                  <DeleteAnimeButton id={a.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
