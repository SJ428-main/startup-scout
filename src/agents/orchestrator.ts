import cron from "node-cron";
import { runDiscoveryAgent } from "./discovery";
import { runResearchAgent } from "./research";
import { runScoringAgent } from "./scoring";
import { getConfig } from "@/lib/config";

export async function runFullPipeline(): Promise<{
  discovery: Awaited<ReturnType<typeof runDiscoveryAgent>>;
  research: Awaited<ReturnType<typeof runResearchAgent>>;
  scoring: Awaited<ReturnType<typeof runScoringAgent>>;
}> {
  console.log("[Orchestrator] Starting full agent pipeline...");

  const discovery = await runDiscoveryAgent();
  console.log(`[Discovery] Found ${discovery.discovered} new startups`);

  const research = await runResearchAgent();
  console.log(`[Research] Analyzed ${research.researched} companies`);

  const scoring = await runScoringAgent();
  console.log(
    `[Scoring] Scored ${scoring.scored} companies, triggered ${scoring.triggered} actions`
  );

  return { discovery, research, scoring };
}

export function startScheduler(): void {
  const interval = getConfig().DISCOVERY_INTERVAL_MINUTES ?? 15;
  const cronExpr = `*/${interval} * * * *`;

  console.log(
    `[Orchestrator] Scheduling discovery every ${interval} minutes (${cronExpr})`
  );

  cron.schedule(cronExpr, async () => {
    try {
      await runFullPipeline();
    } catch (err) {
      console.error("[Orchestrator] Pipeline failed:", err);
    }
  });
}

// Run directly: npx tsx src/agents/orchestrator.ts
const isMain = process.argv[1]?.includes("orchestrator");
if (isMain) {
  startScheduler();
  runFullPipeline().catch(console.error);
}
