import {
  createAgentRun,
  completeAgentRun,
  insertCompany,
  getCompanies,
} from "@/lib/clickhouse/repository";
import { fetchAllSources } from "@/lib/sources/fetchers";
import { addDemoTimelineEvent } from "@/lib/demo/store";

const uuid = () => crypto.randomUUID();

export async function runDiscoveryAgent(): Promise<{
  discovered: number;
  runId: string;
}> {
  const run = await createAgentRun("discovery");

  try {
    const raw = await fetchAllSources();
    const existing = await getCompanies(500);
    const existingNames = new Set(
      existing.map((c) => c.name.toLowerCase())
    );

    let count = 0;
    for (const item of raw) {
      if (existingNames.has(item.name.toLowerCase())) continue;

      const company = await insertCompany({
        name: item.name,
        description: item.description,
        website: item.website,
        github_url: item.github_url,
        launch_date: item.launch_date,
        source_urls: item.source_urls,
        source_type: item.source_type,
      });

      addDemoTimelineEvent({
        id: uuid(),
        company_id: company.id,
        company_name: company.name,
        stage: "discovery",
        timestamp: new Date().toISOString(),
        details: `Discovered from ${item.source_type}`,
      });

      count++;
      existingNames.add(item.name.toLowerCase());
    }

    await completeAgentRun(run.id, count);
    return { discovered: count, runId: run.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await completeAgentRun(run.id, 0, message);
    throw err;
  }
}
