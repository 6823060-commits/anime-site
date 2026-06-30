"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface Genre { id: string; name: string }
interface AnimeData {
  id?: string;
  title?: string;
  titleEn?: string | null;
  description?: string;
  coverImage?: string | null;
  bannerImage?: string | null;
  status?: string;
  type?: string;
  year?: number | null;
  season?: string | null;
  rating?: number;
  totalEps?: number | null;
  genreIds?: string[];
}

export function AnimeForm({ genres, anime }: { genres: Genre[]; anime?: AnimeData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: anime?.title || "",
    titleEn: anime?.titleEn || "",
    description: anime?.description || "",
    coverImage: anime?.coverImage || "",
    bannerImage: anime?.bannerImage || "",
    status: anime?.status || "ONGOING",
    type: anime?.type || "TV",
    year: anime?.year?.toString() || "",
    season: anime?.season || "",
    rating: anime?.rating?.toString() || "",
    totalEps: anime?.totalEps?.toString() || "",
    genreIds: anime?.genreIds || [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleGenre = (id: string) =>
    set("genreIds", form.genreIds.includes(id) ? form.genreIds.filter(g => g !== id) : [...form.genreIds, id]);

  const submit = async () => {
    if (!form.title || !form.description) { setError("Нэр болон тайлбар заавал шаардлагатай."); return; }
    setLoading(true); setError("");
    const body = { ...form, year: form.year ? Number(form.year) : null, rating: form.rating ? Number(form.rating) : null, totalEps: form.totalEps ? Number(form.totalEps) : null };
    const url = anime?.id ? `/api/anime/${anime.id}` : "/api/anime";
    const method = anime?.id ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) router.push("/admin/anime");
    else { const d = await res.json(); setError(d.error || "Алдаа гарлаа."); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="label">Монгол нэр *</label>
          <input className="input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Анимэний нэр" />
        </div>
        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="label">Англи нэр</label>
          <input className="input" value={form.titleEn} onChange={e => set("titleEn", e.target.value)} placeholder="English title" />
        </div>
        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="label">Тайлбар *</label>
          <textarea className="textarea" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Анимэний тухай..." rows={4} />
        </div>
        <div className="form-group">
          <label className="label">Зургийн URL (cover)</label>
          <input className="input" value={form.coverImage} onChange={e => set("coverImage", e.target.value)} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label className="label">Зургийн URL (banner)</label>
          <input className="input" value={form.bannerImage} onChange={e => set("bannerImage", e.target.value)} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label className="label">Төлөв</label>
          <select className="select" value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="ONGOING">Явж байна</option>
            <option value="COMPLETED">Дууссан</option>
            <option value="UPCOMING">Удахгүй</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Анимэний төрөл</label>
          <select className="select" value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="TV">TV</option>
            <option value="MOVIE">Кино</option>
            <option value="OVA">OVA</option>
            <option value="ONA">ONA</option>
            <option value="SPECIAL">SPECIAL</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Он</label>
          <input className="input" type="number" value={form.year} onChange={e => set("year", e.target.value)} placeholder="2024" />
        </div>
        <div className="form-group">
          <label className="label">Улирал</label>
          <select className="select" value={form.season} onChange={e => set("season", e.target.value)}>
            <option value="">—</option>
            <option value="Өвөл">Өвөл</option>
            <option value="Хавар">Хавар</option>
            <option value="Зун">Зун</option>
            <option value="Намар">Намар</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Оноо (0-10)</label>
          <input className="input" type="number" step="0.1" value={form.rating} onChange={e => set("rating", e.target.value)} placeholder="8.5" />
        </div>
        <div className="form-group">
          <label className="label">Нийт ангийн тоо</label>
          <input className="input" type="number" value={form.totalEps} onChange={e => set("totalEps", e.target.value)} placeholder="24" />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Жанр сонгох</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {genres.map(g => (
            <button key={g.id} type="button" className={`genre-tag ${form.genreIds.includes(g.id) ? "active" : ""}`} onClick={() => toggleGenre(g.id)}>{g.name}</button>
          ))}
        </div>
      </div>
      <button className="btn btn-primary" onClick={submit} disabled={loading}>
        <Save size={16}/> {loading ? "Хадгалж байна..." : "Хадгалах"}
      </button>
    </div>
  );
}
