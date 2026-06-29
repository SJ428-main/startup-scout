import {
  createAgentRun,
  completeAgentRun,
  getCompaniesByStatus,
  getResearchByCompanyId,
  insertScore,
  updateCompanyStatus,
} from "@/lib/clickhouse/repository";
import { getConfig, isDemoMode } from "@/lib/config";
import { addDemoTimelineEvent } from "@/lib/demo/store";
const uuid = () => crypto.randomUUID();
import { runActionAgent } from "./action";

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

function computeScore(research: {
  github_stars: number;
  recent_commits: number;
  hn_points: number;
  ph_ranking: number | null;
  hiring_page: string;
  strengths: string[];
}): {
  total: number;
  github_activity: number;
  community_interest: number;
  recent_launches: number;
  hiring_signal: number;
  technical_innovation: number;
  momentum: number;
} {
  const github_activity = clamp(
    (research.github_stars / 20000) * 100 + research.recent_commits * 0.5
  );
  const community_interest = clamp((research.hn_points / 500) * 100);
  const recent_launches = research.ph_ranking
    ? clamp(100 - research.ph_ranking * 8)
    : clamp(research.recent_commits * 2);
  const hiring_signal = research.hiring_page ? 70 : 30;
  const technical_innovation = clamp(research.strengths.length * 20 + 20);
  const momentum = clamp(
    (github_activity * 0.3 +
      community_interest * 0.25 +
      recent_launches * 0.25 +
      momentumBonus(research)) *
      1.1
  );

  const total = clamp(
    github_activity * 0.2 +
      community_interest * 0.2 +
      recent_launches * 0.15 +
      hiring_signal * 0.1 +
      technical_innovation * 0.15 +
      momentum * 0.2
  );

  return {
    total: Math.round(total * 10) / 10,
    github_activity: Math.round(github_activity),
    community_interest: Math.round(community_interest),
    recent_launches: Math.round(recent_launches),
    hiring_signal: Math.round(hiring_signal),
    technical_innovation: Math.round(technical_innovation),
    momentum: Math.round(momentum),
  };
}

function momentumBonus(research: {
  github_stars: number;
  recent_commits: number;
}): number {
  if (research.github_stars > 10000 && research.recent_commits > 20) return 30;
  if (research.github_stars > 5000) return 20;
  return 10;
}

export async function runScoringAgent(): Promise<{
  scored: number;
  triggered: number;
  runId: string;
}> {
  const run = await createAgentRun("scoring");
  const threshold = getConfig().SCORE_THRESHOLD ?? 85;
  let count = 0;
  let triggered = 0;

  try {
    const companies = await getCompaniesByStatus("researched");

    for (const company of companies) {
      const research = await getResearchByCompanyId(company.id);
      if (!research) continue;

      const scores = computeScore(research);
      const shouldTrigger = scores.total > threshold;

      await insertScore({
        company_id: company.id,
        total_score: scores.total,
        github_activity: scores.github_activity,
        community_interest: scores.community_interest,
        recent_launches: scores.recent_launches,
        hiring_signal: scores.hiring_signal,
        technical_innovation: scores.technical_innovation,
        momentum: scores.momentum,
        triggered_action: shouldTrigger,
      });

      await updateCompanyStatus(
        company.id,
        shouldTrigger ? "actioned" : "scored"
      );

      addDemoTimelineEvent({
        id: uuid(),
        company_id: company.id,
        company_name: company.name,
        stage: "scoring",
        timestamp: new Date().toISOString(),
        details: `Score: ${scores.total}/100${shouldTrigger ? " — Action triggered!" : ""}`,
      });

      if (shouldTrigger) {
        await runActionAgent(company.id);
        triggered++;
      }

      count++;
    }

    await completeAgentRun(run.id, count);
    return { scored: count, triggered, runId: run.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await completeAgentRun(run.id, 0, message);
    throw err;
  }
}
