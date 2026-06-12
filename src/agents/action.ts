import {
  createAgentRun,
  completeAgentRun,
  getCompanyById,
  getResearchByCompanyId,
  getScoreByCompanyId,
  insertNotification,
} from "@/lib/clickhouse/repository";
import { executeComposioActions } from "@/lib/composio/client";
import { generateCitedMd, saveCitedMd } from "@/lib/reports/cited";
import { addDemoTimelineEvent } from "@/lib/demo/store";

const uuid = () => crypto.randomUUID();

export async function runActionAgent(companyId: string): Promise<{
  actions: number;
  runId: string;
  reportPath: string;
}> {
  const run = await createAgentRun("action");

  try {
    const [company, research, score] = await Promise.all([
      getCompanyById(companyId),
      getResearchByCompanyId(companyId),
      getScoreByCompanyId(companyId),
    ]);

    if (!company || !research || !score) {
      throw new Error(`Missing data for company ${companyId}`);
    }

    const report = generateCitedMd({ company, research, score });
    const reportPath = await saveCitedMd(company.name, report);

    const composioResults = await executeComposioActions({
      company,
      research,
      score,
      reportContent: report,
    });

    for (const result of composioResults) {
      await insertNotification({
        company_id: companyId,
        channel: result.channel,
        status: result.status,
        payload: result.payload,
      });
    }

    addDemoTimelineEvent({
      id: uuid(),
      company_id: companyId,
      company_name: company.name,
      stage: "notification",
      timestamp: new Date().toISOString(),
      details: `Sent ${composioResults.length} notifications via Composio`,
    });
    addDemoTimelineEvent({
      id: uuid(),
      company_id: companyId,
      company_name: company.name,
      stage: "report",
      timestamp: new Date().toISOString(),
      details: `Generated cited.md at ${reportPath}`,
    });

    await completeAgentRun(run.id, composioResults.length + 1);
    return {
      actions: composioResults.length,
      runId: run.id,
      reportPath,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await completeAgentRun(run.id, 0, message);
    throw err;
  }
}
