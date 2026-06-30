import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, Lock, Crown } from "lucide-react";
import { VideoPlayer } from "@/components/anime/VideoPlayer";
import { CommentsSection } from "@/components/anime/CommentsSection";
import { canWatch, isPremiumActive, getPlan } from "@/lib/plans";

interface Props {
  params: Promise<{ animeId: string }>;
  searchParams: Promise<{ ep?: string }>;
}

const planOrder: Record<string, number> = { FREE: 0, BASIC: 1, PREMIUM: 2 };

export default async function WatchPage({ params, searchParams }: Props) {
  const { animeId } = await params;
  const { ep: epId } = await searchParams;
  const session = await auth();

  const anime = await prisma.anime.findUnique({
    where: { id: animeId },
    include: { episodes: { orderBy: { number: "asc" } } },
  });
  if (!anime) notFound();

  const episode = epId
    ? anime.episodes.find((e) => e.id === epId) || anime.episodes[0]
    : anime.episodes[0];

  if (!episode) notFound();

  // Get user plan
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

  const effectivePlan =
    userPlan !== "FREE" && isPremiumActive(planExpiresAt, userPlan as any)
      ? userPlan
      : "FREE";

  const hasAccess = canWatch(effectivePlan as any, episode.requiredPlan as any);

  // Save watch history only if user has access
  if (session?.user?.id && hasAccess) {
    await prisma.watchHistory.upsert({
      where: { userId_episodeId: { userId: session.user.id, episodeId: episode.id } },
      update: { watchedAt: new Date() },
      create: { userId: session.user.id, episodeId: episode.id },
    });
  }

  const currentIdx = anime.episodes.findIndex((e) => e.id === episode.id);
  const prevEp = anime.episodes[currentIdx - 1];
  const nextEp = anime.episodes[currentIdx + 1];

  const comments = hasAccess
    ? await prisma.comment.findMany({
        where: { episodeId: episode.id },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const requiredPlanInfo = getPlan(episode.requiredPlan as any);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>
      <Link href={`/anime/${animeId}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
        <ArrowLeft size={16} /> {anime.title}
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        {/* Main */}
        <div>
          {/* Video or Lock */}
          {hasAccess ? (
            <VideoPlayer videoUrl={episode.videoUrl} />
          ) : (
            <div className="video-locked">
              <div className="video-locked-content">
                <div style={{ fontSize: 56, marginBottom: 16 }}>
                  {requiredPlanInfo.id === "PREMIUM" ? "👑" : "🔒"}
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                  {requiredPlanInfo.name} эрх шаардлагатай
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, maxWidth: 320 }}>
                  Энэ анги үзэхийн тулд {requiredPlanInfo.name} эрх шаардлагатай.
                  {!session && " Эхлээд нэвтэрнэ үү."}
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {!session ? (
                    <Link href="/auth/login" className="btn btn-primary btn-lg">Нэвтрэх</Link>
                  ) : null}
                  <Link
                    href="/premium"
                    className={`btn btn-lg ${requiredPlanInfo.id === "PREMIUM" ? "btn-gold" : "btn-primary"}`}
                  >
                    <Crown size={18} /> Premium авах
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Episode info + nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                  {episode.number}-р анги{episode.title ? `: ${episode.title}` : ""}
                </h2>
                {episode.isPremium && (
                  <span className={`badge ${episode.requiredPlan === "PREMIUM" ? "badge-premium" : "badge-basic"}`}>
                    {episode.requiredPlan === "PREMIUM" ? <Crown size={10} /> : <Lock size={10} />}
                    {requiredPlanInfo.name}
                  </span>
                )}
              </div>
              {episode.description && (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{episode.description}</p>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {prevEp && (
                <Link href={`/watch/${animeId}?ep=${prevEp.id}`} className="btn btn-secondary btn-sm">
                  <ChevronLeft size={16} /> Өмнөх
                </Link>
              )}
              {nextEp && (
                <Link href={`/watch/${animeId}?ep=${nextEp.id}`} className="btn btn-primary btn-sm">
                  Дараах <ChevronRight size={16} />
                </Link>
              )}
            </div>
          </div>

          {hasAccess && (
            <CommentsSection
              episodeId={episode.id}
              comments={comments.map((c) => ({
                id: c.id,
                content: c.content,
                createdAt: c.createdAt.toISOString(),
                user: { id: c.user.id, name: c.user.name },
              }))}
              userId={session?.user?.id}
            />
          )}
        </div>

        {/* Episode list sidebar */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "var(--text-secondary)" }}>
            Ангиуд ({anime.episodes.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "70vh", overflowY: "auto" }}>
            {anime.episodes.map((ep) => {
              const locked = !canWatch(effectivePlan as any, ep.requiredPlan as any);
              return (
                <Link
                  key={ep.id}
                  href={`/watch/${animeId}?ep=${ep.id}`}
                  className={`episode-item ${ep.id === episode.id ? "active" : ""} ${locked ? "locked" : ""}`}
                >
                  <div className="episode-num">
                    {locked ? <Lock size={14} /> : ep.number}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: ep.id === episode.id ? "var(--text-primary)" : "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ep.title || `${ep.number}-р анги`}
                    </div>
                    {ep.isPremium && (
                      <span style={{ fontSize: 10, color: ep.requiredPlan === "PREMIUM" ? "var(--gold)" : "var(--accent)", fontWeight: 600 }}>
                        {ep.requiredPlan}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
