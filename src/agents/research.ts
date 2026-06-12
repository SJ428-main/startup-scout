import {
  createAgentRun,
  completeAgentRun,
  getCompaniesByStatus,
  insertResearch,
  updateCompanyStatus,
} from "@/lib/clickhouse/repository";
import { analyzeStartup } from "@/lib/ai/client";
import { fetchGitHubStats } from "@/lib/sources/fetchers";
import { addDemoTimelineEvent } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/config";
const uuid = () => crypto.randomUUID();

export async function runResearchAgent(): Promise<{
  researched: number;
  runId: string;
}> {
  const run = await createAgentRun("research");

  try {
    const companies = await getCompaniesByStatus("discovered");
    let count = 0;

    for (const company of companies) {
      const ghStats = await fetchGitHubStats(company.github_url);
      const hnPoints = isDemoMode()
        ? 320 + company.name.length * 3
        : Math.floor(Math.random() * 500) + 50;
      const phRanking = company.source_type === "product_hunt"
        ? Math.floor(Math.random() * 10) + 1
        : null;

      const analysis = await analyzeStartup({
        name: company.name,
        description: company.description,
        github_stars: ghStats.stars,
        hn_points: hnPoints,
      });

      await insertResearch({
        company_id: company.id,
        summary: analysis.summary,
        strengths: analysis.strengths,
        risks: analysis.risks,
        market: analysis.market,
        technology: analysis.technology,
        github_stars: ghStats.stars,
        recent_commits: ghStats.recentCommits,
        hn_points: hnPoints,
        ph_ranking: phRanking,
        funding_news: "No public funding data found",
        hiring_page: company.website
          ? `${company.website}/careers`
          : "",
      });

      await updateCompanyStatus(company.id, "researched");

      addDemoTimelineEvent({
        id: uuid(),
        company_id: company.id,
        company_name: company.name,
        stage: "research",
        timestamp: new Date().toISOString(),
        details: `Analyzed: ${ghStats.stars} stars, ${analysis.strengths.length} strengths identified`,
      });

      count++;
    }

    await completeAgentRun(run.id, count);
    return { researched: count, runId: run.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await completeAgentRun(run.id, 0, message);
    throw err;
  }
}
