"use client";
import { useState } from "react";
import { Crown, Zap, X, RefreshCw, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/plans";

interface Props {
  planId: string;
  planName: string;
  price: number;
  isCurrent: boolean;
}

type Step = "idle" | "method" | "qpay" | "checking" | "success";

export function PlanCheckoutButton({ planId, planName, price, isCurrent }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [paymentData, setPaymentData] = useState<{ invoiceId: string; qrCode: string; paymentId: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isPremium = planId === "PREMIUM";

  const startPayment = async (method: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, method }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Алдаа гарлаа."); setLoading(false); return; }
      setPaymentData({ invoiceId: data.invoiceId, qrCode: data.qrCode, paymentId: data.paymentId });
      setStep("qpay");
    } catch {
      setError("Серверт холбогдохгүй байна.");
    }
    setLoading(false);
  };

  const checkPayment = async () => {
    if (!paymentData) return;
    setStep("checking");
    try {
      const res = await fetch(`/api/payment/check?paymentId=${paymentData.paymentId}`);
      const data = await res.json();
      if (data.paid) {
        setStep("success");
        setTimeout(() => { window.location.reload(); }, 2000);
      } else {
        setStep("qpay");
        setError("Төлбөр бүртгэгдээгүй байна. Дахин шалгана уу.");
      }
    } catch {
      setStep("qpay");
    }
  };

  const close = () => { setStep("idle"); setPaymentData(null); setError(""); };

  if (isCurrent) {
    return (
      <div className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", cursor: "default" }}>
        <CheckCircle size={16} color="var(--success)" /> Идэвхтэй төлөвлөгөө
      </div>
    );
  }

  return (
    <>
      <button
        className={`btn ${isPremium ? "btn-gold" : "btn-primary"} btn-lg`}
        style={{ width: "100%", justifyContent: "center" }}
        onClick={() => setStep("method")}
      >
        {isPremium ? <Crown size={18} /> : <Zap size={18} />}
        {planName} авах
      </button>

      {/* Modal */}
      {step !== "idle" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                {step === "success" ? "Амжилттай!" : `${planName} — ${formatPrice(price)}`}
              </h2>
              <button onClick={close} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Step: Choose method */}
            {step === "method" && (
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>Төлбөрийн аргаа сонгоно уу:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button className="btn btn-secondary" style={{ justifyContent: "flex-start", padding: "14px 20px" }} onClick={() => startPayment("QPAY")} disabled={loading}>
                    <img src="https://qpay.mn/img/qpay_logo.svg" alt="QPay" style={{ height: 24 }} onError={e => (e.currentTarget.style.display = "none")} />
                    <span style={{ fontWeight: 600 }}>QPay</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: "auto" }}>QR код уншуулах</span>
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: "flex-start", padding: "14px 20px" }} onClick={() => startPayment("SOCIALPAY")} disabled={loading}>
                    <span style={{ fontWeight: 600 }}>💳 SocialPay</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: "auto" }}>Банкны карт</span>
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: "flex-start", padding: "14px 20px" }} onClick={() => startPayment("CARD")} disabled={loading}>
                    <span style={{ fontWeight: 600 }}>🏦 Банкны шилжүүлэг</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: "auto" }}>Дансаар</span>
                  </button>
                </div>
                {loading && <div style={{ textAlign: "center", marginTop: 20, color: "var(--text-muted)", fontSize: 14 }}>Нэхэмжлэл үүсгэж байна...</div>}
              </div>
            )}

            {/* Step: Show QR */}
            {(step === "qpay" || step === "checking") && paymentData && (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
                  QPay апп-аар дараах QR кодыг уншуулаад төлбөрөө хийнэ үү.
                </p>
                <div className="qr-box">
                  {paymentData.qrCode ? (
                    <img src={`data:image/png;base64,${paymentData.qrCode}`} alt="QPay QR" />
                  ) : (
                    <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: 13 }}>
                      QR код ачаалж байна...
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                  Нэхэмжлэлийн дугаар: <strong style={{ color: "var(--text-primary)" }}>{paymentData.invoiceId}</strong>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={checkPayment}
                  disabled={step === "checking"}
                >
                  <RefreshCw size={16} className={step === "checking" ? "spin" : ""} />
                  {step === "checking" ? "Шалгаж байна..." : "Төлбөр шалгах"}
                </button>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                  Төлбөр хийсний дараа дээрх товчийг дарна уу.
                </p>
              </div>
            )}

            {/* Step: Success */}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Төлбөр амжилттай!</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                  <strong style={{ color: "var(--gold)" }}>{planName}</strong> эрх нээгдлээ.<br />
                  Хуудас дахин ачаалж байна...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
