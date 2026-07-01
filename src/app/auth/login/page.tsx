"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Имэйл эсвэл нууц үг буруу байна.");
    else router.push("/");
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)", marginBottom: 8 }}>アニメMN</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Нэвтрэх</h1>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="label">Имэйл</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="та@жишээ.мн" />
        </div>
        <div className="form-group">
          <label className="label">Нууц үг</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="••••••••" />
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={submit} disabled={loading}>
          <LogIn size={16}/> {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>эсвэл</span>
  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
</div>
<button
  className="btn btn-secondary"
  style={{ width: "100%", justifyContent: "center" }}
  onClick={() => signIn("google", { callbackUrl: "/" })}
>
  🔍 Google-ээр нэвтрэх
</button>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
          Бүртгэл байхгүй юу? <Link href="/auth/register" style={{ color: "var(--accent)" }}>Бүртгүүлэх</Link>
          <p style={{ textAlign: "center", marginTop: 10, fontSize: 13 }}>
  <Link href="/auth/forgot-password" style={{ color: "var(--text-muted)" }}>Нууц үгээ мартсан уу?</Link>
</p>
        </p>
      </div>
    </div>
  );
}
