"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (!name || !email || !password) { setError("Бүх талбарыг бөглөнө үү."); return; }
    if (password.length < 6) { setError("Нууц үг дор хаяж 6 тэмдэгт байх ёстой."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) router.push("/auth/login");
    else { const d = await res.json(); setError(d.error || "Алдаа гарлаа."); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", marginBottom: 8 }}>アニメMN</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Бүртгүүлэх</h1>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group"><label className="label">Нэр</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Нэр" /></div>
        <div className="form-group"><label className="label">Имэйл</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="та@жишээ.мн" /></div>
        <div className="form-group"><label className="label">Нууц үг</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="дор хаяж 6 тэмдэгт" /></div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={submit} disabled={loading}>
          <UserPlus size={16}/> {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
        </button>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
          Бүртгэлтэй юу? <Link href="/auth/login" style={{ color: "var(--accent)" }}>Нэвтрэх</Link>
        </p>
      </div>
    </div>
  );
}
