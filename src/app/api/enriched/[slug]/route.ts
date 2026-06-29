import { NextResponse } from "next/server";
import { DEMO_STARTUPS } from "@/data/demoStartups";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Always check demo data first (fast, always available)
  const demo = DEMO_STARTUPS.find((s) => s.slug === slug);
  if (demo) return NextResponse.json(demo);

  // For live-mode startups that aren't in the demo set, look them up by slug in Neon
  try {
    const { getCompanies, getScoreByCompanyId, getResearchByCompanyId } = await import(
      "@/lib/clickhouse/repository"
    );
    const companies = await getCompanies(200);
    const company = companies.find(
      (c) => c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
    );
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [score, research] = await Promise.all([
      getScoreByCompanyId(company.id).catch(() => null),
      getResearchByCompanyId(company.id).catch(() => null),
    ]);

    const explanation: string[] = [];
    if (research?.github_stars && research.github_stars > 1000)
      explanation.push(`${research.github_stars.toLocaleString()} GitHub stars`);
    if (research?.recent_commits) explanation.push(`${research.recent_commits} commits recently`);
    if (research?.strengths?.[0]) explanation.push(research.strengths[0]);
    if (research?.strengths?.[1]) explanation.push(research.strengths[1]);
    if (explanation.length === 0) explanation.push("Discovered via public startup signals");

    return NextResponse.json({
      id: company.id,
      slug,
      name: company.name,
      description: company.description,
      category: "Developer Tools",
      location: "Remote",
      website_url: company.website || null,
      github_url: company.github_url || null,
      source_tags: [company.source_type.replace(/_/g, " ")],
      total_score: score?.total_score ?? 0,
      github_growth_score: score?.github_activity ?? 0,
      engineering_activity_score: score?.technical_innovation ?? 0,
      community_score: score?.community_interest ?? 0,
      product_traction_score: score?.recent_launches ?? 0,
      hiring_signal_score: score?.hiring_signal ?? 0,
      star_growth_30d: research ? Math.round(research.github_stars / 200) : 0,
      commits_30d: research?.recent_commits ?? 0,
      contributors_90d: 0,
      releases_90d: 0,
      hn_mentions_30d: research?.hn_points ? Math.floor(research.hn_points / 30) : 0,
      product_mentions_30d: 0,
      hiring_signals: 0,
      github_stars: research?.github_stars ?? 0,
      last_seen_at: company.discovered_at,
      explanation,
      status: company.status,
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
