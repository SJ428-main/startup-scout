import { NextResponse } from "next/server";
import { DEMO_STARTUPS, DEMO_STATS } from "@/data/demoStartups";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const source = searchParams.get("source");
  const minScore = searchParams.get("minScore");
  const sort = searchParams.get("sort") ?? "score";
  const q = searchParams.get("q")?.toLowerCase();

  let startups = [...DEMO_STARTUPS];

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

  if (sort === "score") startups.sort((a, b) => b.total_score - a.total_score);
  else if (sort === "github_growth") startups.sort((a, b) => b.star_growth_30d - a.star_growth_30d);
  else if (sort === "engineering") startups.sort((a, b) => b.engineering_activity_score - a.engineering_activity_score);
  else if (sort === "newest") startups.sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime());

  return NextResponse.json({ startups, stats: DEMO_STATS });
}
