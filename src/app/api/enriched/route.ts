import { NextResponse } from "next/server";
import { DEMO_STARTUPS, DEMO_STATS } from "@/data/demoStartups";
import { isDemoMode } from "@/lib/config";
import type { EnrichedStartup } from "@/types/enriched";

/** Build EnrichedStartup objects from real Neon data. */
async function getLiveStartups(): Promise<EnrichedStartup[]> {
  const { getCompanies, getScoreByCompanyId, getResearchByCompanyId } = await import(
    "@/lib/clickhouse/repository"
  );

  const companies = await getCompanies(100);
  if (companies.length === 0) return [];

  const enriched = await Promise.all(
    companies.map(async (c) => {
      const [score, research] = await Promise.all([
        getScoreByCompanyId(c.id).catch(() => null),
        getResearchByCompanyId(c.id).catch(() => null),
      ]);

      const totalScore = score?.total_score ?? 0;

      // Build explanation bullets from available signals
      const explanation: string[] = [];
      if (research?.github_stars && research.github_stars > 1000)
        explanation.push(`${research.github_stars.toLocaleString()} GitHub stars`);
      if (research?.recent_commits && research.recent_commits > 0)
        explanation.push(`${research.recent_commits} commits in the last 30 days`);
      if (research?.hn_points && research.hn_points > 50)
        explanation.push(`${research.hn_points} Hacker News points`);
      if (score?.hiring_signal && score.hiring_signal > 50)
        explanation.push("Hiring signal detected");
      if (research?.strengths?.[0]) explanation.push(research.strengths[0]);
      if (explanation.length === 0) explanation.push("Discovered via public startup signals");

      const enrichedStartup: EnrichedStartup = {
        id: c.id,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: c.name,
        description: c.description,
        category: mapSourceTypeToCategory(c.source_type),
        location: "Remote",
        website_url: c.website || null,
        github_url: c.github_url || null,
        source_tags: mapSourceType(c.source_type),
        total_score: totalScore,
        github_growth_score: score?.github_activity ?? 0,
        engineering_activity_score: score?.technical_innovation ?? 0,
        community_score: score?.community_interest ?? 0,
        product_traction_score: score?.recent_launches ?? 0,
        hiring_signal_score: score?.hiring_signal ?? 0,
        star_growth_30d: research ? Math.round((research.github_stars / 200)) : 0,
        commits_30d: research?.recent_commits ?? 0,
        contributors_90d: 0,
        releases_90d: 0,
        hn_mentions_30d: research?.hn_points ? Math.floor(research.hn_points / 30) : 0,
        product_mentions_30d: research?.ph_ranking ? Math.max(0, 10 - research.ph_ranking) : 0,
        hiring_signals: score?.hiring_signal && score.hiring_signal > 50 ? 1 : 0,
        github_stars: research?.github_stars ?? 0,
        last_seen_at: c.discovered_at,
        explanation,
        status: c.status,
      };

      return enrichedStartup;
    })
  );

  return enriched.filter((s) => s.total_score > 0 || s.github_stars > 0);
}

function mapSourceTypeToCategory(sourceType: string): string {
  if (sourceType.includes("agent") || sourceType.includes("ai")) return "AI Agents";
  if (sourceType === "github_trending") return "Developer Tools";
  if (sourceType === "hacker_news") return "AI Infrastructure";
  if (sourceType === "product_hunt") return "Developer Tools";
  return "AI Infrastructure";
}

function mapSourceType(sourceType: string): string[] {
  const map: Record<string, string> = {
    github_trending: "GitHub Trending",
    hacker_news: "Hacker News",
    product_hunt: "Product Hunt",
    rss: "RSS",
    ai_blog: "RSS",
  };
  return [map[sourceType] ?? "GitHub Trending"];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const source = searchParams.get("source");
  const minScore = searchParams.get("minScore");
  const sort = searchParams.get("sort") ?? "score";
  const q = searchParams.get("q")?.toLowerCase();

  // In demo mode, always use static demo data
  // In live mode, try Neon first and fall back to demo if empty
  let startups: EnrichedStartup[] = [];

  if (!isDemoMode()) {
    try {
      startups = await getLiveStartups();
    } catch (err) {
      console.error("[enriched] Neon query failed, falling back to demo:", err);
    }
  }

  // Fall back to demo data when live DB is empty or we're in demo mode
  if (startups.length === 0) {
    startups = [...DEMO_STARTUPS];
  }

  // Apply filters
  if (q) {
    startups = startups.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }
  if (category) startups = startups.filter((s) => s.category === category);
  if (source) startups = startups.filter((s) => s.source_tags.includes(source));
  if (minScore) startups = startups.filter((s) => s.total_score >= Number(minScore));

  // Sort
  if (sort === "score") startups.sort((a, b) => b.total_score - a.total_score);
  else if (sort === "github_growth") startups.sort((a, b) => b.star_growth_30d - a.star_growth_30d);
  else if (sort === "engineering") startups.sort((a, b) => b.engineering_activity_score - a.engineering_activity_score);
  else if (sort === "newest") startups.sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime());

  const stats = {
    ...DEMO_STATS,
    startups_scored: startups.length,
    highest_score: startups.length > 0 ? Math.max(...startups.map((s) => s.total_score)) : DEMO_STATS.highest_score,
  };

  return NextResponse.json({ startups, stats });
}
