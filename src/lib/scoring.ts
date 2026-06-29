import type { EnrichedStartup } from "@/types/enriched";

export const SCORE_WEIGHTS = {
  github_growth: 0.35,
  engineering_activity: 0.25,
  community: 0.15,
  product_traction: 0.15,
  hiring_signal: 0.10,
} as const;

export const SCORE_DIMENSIONS = [
  { key: "github_growth_score" as const, label: "GitHub Growth", weight: "35%", color: "text-scout-cyan", bgColor: "bg-scout-cyan" },
  { key: "engineering_activity_score" as const, label: "Engineering Activity", weight: "25%", color: "text-scout-purple", bgColor: "bg-scout-purple" },
  { key: "community_score" as const, label: "Community", weight: "15%", color: "text-scout-amber", bgColor: "bg-scout-amber" },
  { key: "product_traction_score" as const, label: "Product Traction", weight: "15%", color: "text-scout-green", bgColor: "bg-scout-green" },
  { key: "hiring_signal_score" as const, label: "Hiring Signal", weight: "10%", color: "text-muted-foreground", bgColor: "bg-muted" },
] as const;

export function calculateStartupScore(signals: Pick<EnrichedStartup,
  "star_growth_30d" | "commits_30d" | "contributors_90d" | "releases_90d" |
  "hn_mentions_30d" | "product_mentions_30d" | "hiring_signals" | "github_stars"
>) {
  const github_growth_score = Math.min(100,
    (signals.star_growth_30d / 50) * 70 +
    (Math.min(signals.github_stars, 50000) / 50000) * 30
  );
  const engineering_activity_score = Math.min(100,
    (Math.min(signals.commits_30d, 60) / 60) * 50 +
    (Math.min(signals.contributors_90d, 100) / 100) * 30 +
    (Math.min(signals.releases_90d, 15) / 15) * 20
  );
  const community_score = Math.min(100,
    (Math.min(signals.hn_mentions_30d, 15) / 15) * 60 +
    (Math.min(signals.product_mentions_30d, 25) / 25) * 40
  );
  const product_traction_score = Math.min(100,
    (Math.min(signals.product_mentions_30d, 25) / 25) * 50 +
    (Math.min(signals.releases_90d, 15) / 15) * 30 +
    (Math.min(signals.hn_mentions_30d, 15) / 15) * 20
  );
  const hiring_signal_score = Math.min(100,
    (Math.min(signals.hiring_signals, 10) / 10) * 100
  );

  const total_score =
    github_growth_score * SCORE_WEIGHTS.github_growth +
    engineering_activity_score * SCORE_WEIGHTS.engineering_activity +
    community_score * SCORE_WEIGHTS.community +
    product_traction_score * SCORE_WEIGHTS.product_traction +
    hiring_signal_score * SCORE_WEIGHTS.hiring_signal;

  return {
    total_score: Math.round(total_score * 10) / 10,
    github_growth_score: Math.round(github_growth_score),
    engineering_activity_score: Math.round(engineering_activity_score),
    community_score: Math.round(community_score),
    product_traction_score: Math.round(product_traction_score),
    hiring_signal_score: Math.round(hiring_signal_score),
  };
}

export function getScoreBreakdown(startup: EnrichedStartup) {
  return SCORE_DIMENSIONS.map((d) => ({
    ...d,
    score: startup[d.key],
  }));
}
