"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Genre { id: string; name: string; count: number }

export function GenreManager({ genres: initial }: { genres: Genre[] }) {
  const router = useRouter();
  const [genres, setGenres] = useState(initial);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    setLoading(true); setError("");
    const res = await fetch("/api/genres", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (res.ok) { const g = await res.json(); setGenres([...genres, { ...g, count: 0 }]); setName(""); }
    else { const d = await res.json(); setError(d.error || "Алдаа"); }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await fetch(`/api/genres/${id}`, { method: "DELETE" });
    setGenres(genres.filter(g => g.id !== id));
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32, alignItems: "start" }}>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Шинэ төрөл нэмэх</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Төрлийн нэр..." onKeyDown={e => e.key === "Enter" && add()} />
          <button className="btn btn-primary" onClick={add} disabled={loading}><Plus size={16}/></button>
        </div>
      </div>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Бүх төрлүүд ({genres.length})</h2>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="table">
            <thead><tr><th>Нэр</th><th>Анимэ</th><th></th></tr></thead>
            <tbody>
              {genres.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td>{g.count}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(g.id)}><Trash2 size={13}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
