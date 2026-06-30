"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Lock } from "lucide-react";

interface Anime { id: string; title: string }

export function EpisodeForm({ animes }: { animes: Anime[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    animeId: "", number: "", title: "", description: "",
    videoUrl: "", duration: "", thumbnail: "",
    isPremium: false, requiredPlan: "FREE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.animeId || !form.number || !form.videoUrl) {
      setError("Анимэ, дугаар, видео URL заавал шаардлагатай.");
      return;
    }
    setLoading(true); setError("");
    const res = await fetch("/api/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        number: Number(form.number),
        duration: form.duration ? Number(form.duration) : null,
      }),
    });
    if (res.ok) {
      setForm({ animeId: form.animeId, number: "", title: "", description: "", videoUrl: "", duration: "", thumbnail: "", isPremium: false, requiredPlan: "FREE" });
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error || "Алдаа гарлаа.");
    }
    setLoading(false);
  };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="label">Анимэ *</label>
        <select className="select" value={form.animeId} onChange={(e) => set("animeId", e.target.value)}>
          <option value="">Анимэ сонгох...</option>
          {animes.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="form-group">
          <label className="label">Дугаар *</label>
          <input className="input" type="number" value={form.number} onChange={(e) => set("number", e.target.value)} placeholder="1" />
        </div>
        <div className="form-group">
          <label className="label">Хугацаа (сек)</label>
          <input className="input" type="number" value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="1440" />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Гарчиг</label>
        <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Анги гарчиг" />
      </div>
      <div className="form-group">
        <label className="label">Видео URL * (.mp4, HLS)</label>
        <input className="input" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://..." />
      </div>
      <div className="form-group">
        <label className="label">Thumbnail URL</label>
        <input className="input" value={form.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} placeholder="https://..." />
      </div>
      <div className="form-group">
        <label className="label">Тайлбар</label>
        <textarea className="textarea" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
      </div>

      {/* Premium lock settings */}
      <div className="card" style={{ padding: 16, marginBottom: 16, border: form.isPremium ? "1px solid var(--gold)" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: form.isPremium ? 14 : 0 }}>
          <Lock size={16} color={form.isPremium ? "var(--gold)" : "var(--text-muted)"} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Premium түгжээ</span>
          <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.isPremium}
              onChange={(e) => { set("isPremium", e.target.checked); if (!e.target.checked) set("requiredPlan", "FREE"); }}
              style={{ width: 16, height: 16, accentColor: "var(--gold)" }}
            />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Идэвхжүүлэх</span>
          </label>
        </div>
        {form.isPremium && (
          <div>
            <label className="label">Шаардлагатай эрх</label>
            <select className="select" value={form.requiredPlan} onChange={(e) => set("requiredPlan", e.target.value)}>
              <option value="BASIC">Basic — 4,900₮/сар</option>
              <option value="PREMIUM">Premium — 9,900₮/сар</option>
            </select>
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={loading}>
        <Save size={15} /> {loading ? "Хадгалж байна..." : "Анги нэмэх"}
      </button>
    </div>
  );
}
