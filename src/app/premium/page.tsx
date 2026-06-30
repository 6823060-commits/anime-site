import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, formatPrice, formatDate, isPremiumActive } from "@/lib/plans";
import { Crown, Check, Zap } from "lucide-react";
import { PlanCheckoutButton } from "@/components/premium/PlanCheckoutButton";

export default async function PremiumPage() {
  const session = await auth();

  let userPlan = "FREE";
  let planExpiresAt: Date | null = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, planExpiresAt: true },
    });
    userPlan = user?.plan || "FREE";
    planExpiresAt = user?.planExpiresAt || null;
  }

  const isActive = isPremiumActive(planExpiresAt, userPlan as any);

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
          <Crown size={14} color="var(--gold)" />
          <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>ANIME MN PREMIUM</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
          Илүү сайн үзэх туршлага<br />
          <span style={{ color: "var(--accent)" }}>Premium-тэй</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
          Бүх ангиудыг HD чанартай, сурталчилгаагүй үзэх боломжийг нээгээрэй.
        </p>
      </div>

      {/* Current plan banner */}
      {session && (
        <div className="premium-banner" style={{ marginBottom: 48 }}>
          <Crown size={28} color={isActive ? "var(--gold)" : "var(--text-muted)"} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>
              Таны одоогийн төлөвлөгөө:{" "}
              <span style={{ color: isActive ? "var(--gold)" : "var(--text-secondary)" }}>
                {PLANS.find(p => p.id === userPlan)?.name || "Үнэгүй"}
              </span>
            </div>
            {isActive && planExpiresAt ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {formatDate(planExpiresAt)} хүртэл идэвхтэй
              </div>
            ) : userPlan !== "FREE" ? (
              <div style={{ fontSize: 13, color: "var(--danger)" }}>Хугацаа дууссан</div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Premium-г дараах сонголтуудаас аваарай</div>
            )}
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 900, margin: "0 auto" }}>
        {PLANS.map((plan) => (
          <div key={plan.id} className={`plan-card plan-${plan.id.toLowerCase()}`}>
            {plan.badge && <div className="plan-card-badge">{plan.badge}</div>}

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              {plan.id === "PREMIUM" ? <Crown size={22} color="var(--gold)" /> : plan.id === "BASIC" ? <Zap size={22} color="var(--accent)" /> : null}
              <span style={{ fontSize: 18, fontWeight: 700 }}>{plan.name}</span>
            </div>

            <div className="plan-price">
              {plan.price === 0 ? "Үнэгүй" : formatPrice(plan.price)}
              {plan.price > 0 && <span> / {plan.duration} хоног</span>}
            </div>

            <ul className="plan-features">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            {plan.id === "FREE" ? (
              <div className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", cursor: "default" }}>
                {userPlan === "FREE" ? "Одоогийн төлөвлөгөө" : "Суурь төлөвлөгөө"}
              </div>
            ) : session ? (
              <PlanCheckoutButton
                planId={plan.id}
                planName={plan.name}
                price={plan.price}
                isCurrent={userPlan === plan.id && isActive}
              />
            ) : (
              <a href="/auth/login" className={`btn ${plan.id === "PREMIUM" ? "btn-gold" : "btn-primary"}`} style={{ width: "100%", justifyContent: "center" }}>
                Нэвтрэх шаардлагатай
              </a>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 640, margin: "64px auto 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>Түгээмэл асуултууд</h2>
        {[
          { q: "Төлбөрийг яаж төлөх вэ?", a: "QPay, SocialPay болон банкны карт ашиглан төлөх боломжтой." },
          { q: "Premium анги гэж юу вэ?", a: "Зарим ангиуд Premium эсвэл Basic эрх шаарддаг. Эдгээр ангид 🔒 тэмдэг байна." },
          { q: "Хугацаа дуусвал яах вэ?", a: "Хугацаа дуусмагц Premium ангиуд дахин хаагдана. Та хүссэн үедээ сунгах боломжтой." },
          { q: "Буцаан олгох бодлого?", a: "Төлбөр хийснээс хойш 24 цагийн дотор хүсэлт гаргавал буцааж олгоно." },
        ].map((item) => (
          <div key={item.q} style={{ borderBottom: "1px solid var(--border)", padding: "20px 0" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{item.q}</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
