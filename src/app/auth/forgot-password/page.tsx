"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, KeyRound, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "password" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) { setError("Имэйл оруулна уу."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setStep("otp");
    setLoading(false);
  };

  const verifyCode = async () => {
    if (!code) { setError("Кодыг оруулна уу."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setStep("password");
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!newPassword) { setError("Шинэ нууц үг оруулна уу."); return; }
    if (newPassword !== confirmPassword) { setError("Нууц үг таарахгүй байна."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setStep("done");
    setLoading(false);
  };

  const steps = [
    { key: "email", label: "Имэйл", icon: <Mail size={14} /> },
    { key: "otp", label: "Код", icon: <KeyRound size={14} /> },
    { key: "password", label: "Нууц үг", icon: <Lock size={14} /> },
  ];
  const currentStepIdx = steps.findIndex((s) => s.key === step);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--accent)", marginBottom: 6 }}>アニメMN</div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Нууц үг сэргээх</h1>
        </div>

        {/* Step indicator */}
        {step !== "done" && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                  background: i < currentStepIdx ? "var(--success)" : i === currentStepIdx ? "var(--accent)" : "var(--bg-hover)",
                  color: i <= currentStepIdx ? "#fff" : "var(--text-muted)",
                }}>
                  {i < currentStepIdx ? "✓" : s.icon}
                </div>
                <div style={{ fontSize: 11, color: i === currentStepIdx ? "var(--text-primary)" : "var(--text-muted)", marginLeft: 6, flex: 1 }}>
                  {s.label}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ height: 2, flex: 1, background: i < currentStepIdx ? "var(--success)" : "var(--border)", marginRight: 6 }} />
                )}
              </div>
            ))}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {step === "email" && (
          <>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
              Бүртгэлтэй имэйл хаягаа оруулна уу. Нууц үг сэргээх код илгээх болно.
            </p>
            <div className="form-group">
              <label className="label">Имэйл хаяг</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                placeholder="та@gmail.com"
                autoFocus
              />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={sendOtp} disabled={loading}>
              <Mail size={16} /> {loading ? "Илгээж байна..." : "Код илгээх"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="alert alert-success" style={{ marginBottom: 20 }}>
              <strong>{email}</strong> хаяг руу код илгээлээ. Spam хавтсаа ч шалгаарай.
            </div>
            <div className="form-group">
              <label className="label">6 оронтой код</label>
              <input
                className="input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                placeholder="123456"
                maxLength={6}
                autoFocus
                style={{ fontSize: 24, letterSpacing: 8, textAlign: "center", fontWeight: 700 }}
              />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={verifyCode} disabled={loading || code.length !== 6}>
              <KeyRound size={16} /> {loading ? "Шалгаж байна..." : "Баталгаажуулах"}
            </button>
            <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => { setStep("email"); setCode(""); setError(""); }}>
              ← Буцах
            </button>
          </>
        )}

        {step === "password" && (
          <>
            <div className="form-group">
              <label className="label">Шинэ нууц үг</label>
              <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" autoFocus />
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>
                8+ тэмдэгт, A-Z, a-z, 0-9, тусгай тэмдэгт (!@#$%)
              </div>
            </div>
            <div className="form-group">
              <label className="label">Нууц үг давтах</label>
              <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && resetPassword()} placeholder="••••••••" />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={resetPassword} disabled={loading}>
              <Lock size={16} /> {loading ? "Хадгалж байна..." : "Нууц үг солих"}
            </button>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Амжилттай!</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
              Нууц үг амжилттай шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.
            </p>
            <Link href="/auth/login" className="btn btn-primary" style={{ justifyContent: "center" }}>
              Нэвтрэх →
            </Link>
          </div>
        )}

        {step !== "done" && (
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            <Link href="/auth/login" style={{ color: "var(--accent)" }}>← Нэвтрэх рүү буцах</Link>
          </p>
        )}
      </div>
    </div>
  );
}