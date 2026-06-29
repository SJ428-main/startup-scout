import { insert, query } from "./client";
import type {
  AgentRun,
  AgentType,
  Company,
  Notification,
  ResearchAnalysis,
  Source,
  StartupScore,
} from "@/types";

const uuid = () => crypto.randomUUID();

export async function getCompanies(limit = 50): Promise<Company[]> {
  return query<Company>(
    `SELECT * FROM companies ORDER BY discovered_at DESC LIMIT {limit:UInt32}`,
    { limit }
  );
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const rows = await query<Company>(
    `SELECT * FROM companies WHERE id = {id:String} LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function getCompaniesByStatus(
  status: Company["status"]
): Promise<Company[]> {
  return query<Company>(
    `SELECT * FROM companies WHERE status = {status:String}`,
    { status }
  );
}

export async function insertCompany(
  company: Omit<Company, "id" | "discovered_at" | "status"> & {
    id?: string;
    discovered_at?: string;
    status?: Company["status"];
  }
): Promise<Company> {
  const row: Company = {
    id: company.id ?? uuid(),
    name: company.name,
    description: company.description,
    website: company.website,
    github_url: company.github_url,
    launch_date: company.launch_date,
    source_urls: company.source_urls,
    source_type: company.source_type,
    discovered_at: company.discovered_at ?? new Date().toISOString(),
    status: company.status ?? "discovered",
  };
  await insert("companies", [row as unknown as Record<string, unknown>]);
  return row;
}

export async function updateCompanyStatus(
  id: string,
  status: Company["status"]
): Promise<void> {
  const { isDemoMode } = await import("@/lib/config");
  if (isDemoMode()) {
    const { getDemoStore } = await import("@/lib/demo/store");
    getDemoStore().updateCompanyStatus(id, status);
    return;
  }
  await query(
    `ALTER TABLE companies UPDATE status = {status:String} WHERE id = {id:String}`,
    { status, id }
  );
}

export async function insertResearch(
  research: Omit<ResearchAnalysis, "id" | "analyzed_at"> & {
    id?: string;
    analyzed_at?: string;
  }
): Promise<ResearchAnalysis> {
  const row: ResearchAnalysis = {
    id: research.id ?? uuid(),
    company_id: research.company_id,
    summary: research.summary,
    strengths: research.strengths,
    risks: research.risks,
    market: research.market,
    technology: research.technology,
    github_stars: research.github_stars,
    recent_commits: research.recent_commits,
    hn_points: research.hn_points,
    ph_ranking: research.ph_ranking,
    funding_news: research.funding_news,
    hiring_page: research.hiring_page,
    analyzed_at: research.analyzed_at ?? new Date().toISOString(),
  };
  await insert("research", [row as unknown as Record<string, unknown>]);
  return row;
}

export async function getResearchByCompanyId(
  companyId: string
): Promise<ResearchAnalysis | null> {
  const rows = await query<ResearchAnalysis>(
    `SELECT * FROM research WHERE company_id = {company_id:String} ORDER BY analyzed_at DESC LIMIT 1`,
    { company_id: companyId }
  );
  return rows[0] ?? null;
}

export async function insertScore(
  score: Omit<StartupScore, "id" | "scored_at"> & {
    id?: string;
    scored_at?: string;
  }
): Promise<StartupScore> {
  const row: StartupScore = {
    id: score.id ?? uuid(),
    company_id: score.company_id,
    total_score: score.total_score,
    github_activity: score.github_activity,
    community_interest: score.community_interest,
    recent_launches: score.recent_launches,
    hiring_signal: score.hiring_signal,
    technical_innovation: score.technical_innovation,
    momentum: score.momentum,
    scored_at: score.scored_at ?? new Date().toISOString(),
    triggered_action: score.triggered_action,
  };
  await insert("scores", [row as unknown as Record<string, unknown>]);
  return row;
}

export async function getTopScores(limit = 20): Promise<
  (StartupScore & { company_name?: string })[]
> {
  const scores = await query<StartupScore>(
    `SELECT * FROM scores ORDER BY total_score DESC LIMIT {limit:UInt32}`,
    { limit }
  );
  const enriched = await Promise.all(
    scores.map(async (s) => {
      const company = await getCompanyById(s.company_id);
      return { ...s, company_name: company?.name };
    })
  );
  return enriched;
}

export async function getScoreByCompanyId(
  companyId: string
): Promise<StartupScore | null> {
  const rows = await query<StartupScore>(
    `SELECT * FROM scores WHERE company_id = {company_id:String} ORDER BY scored_at DESC LIMIT 1`,
    { company_id: companyId }
  );
  return rows[0] ?? null;
}

export async function createAgentRun(
  agentType: AgentType
): Promise<AgentRun> {
  const run: AgentRun = {
    id: uuid(),
    agent_type: agentType,
    status: "running",
    started_at: new Date().toISOString(),
    completed_at: null,
    items_processed: 0,
    error_message: null,
    metadata: {},
  };
  await insert("agent_runs", [run as unknown as Record<string, unknown>]);
  return run;
}

export async function completeAgentRun(
  id: string,
  itemsProcessed: number,
  error?: string
): Promise<void> {
  const status = error ? "failed" : "completed";
  const { isDemoMode } = await import("@/lib/config");
  if (isDemoMode()) {
    const { getDemoStore } = await import("@/lib/demo/store");
    getDemoStore().updateAgentRun(id, {
      status,
      completed_at: new Date().toISOString(),
      items_processed: itemsProcessed,
      error_message: error ?? null,
    });
    return;
  }
  await query(
    `ALTER TABLE agent_runs UPDATE status = {status:String}, completed_at = now64(3), items_processed = {items:UInt32}, error_message = {error:Nullable(String)} WHERE id = {id:String}`,
    { id, status, items: itemsProcessed, error: error ?? null }
  );
}

export async function getAgentRuns(limit = 50): Promise<AgentRun[]> {
  return query<AgentRun>(
    `SELECT * FROM agent_runs ORDER BY started_at DESC LIMIT {limit:UInt32}`,
    { limit }
  );
}

export async function insertNotification(
  notification: Omit<Notification, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  }
): Promise<Notification> {
  const row: Notification = {
    id: notification.id ?? uuid(),
    company_id: notification.company_id,
    channel: notification.channel,
    status: notification.status,
    payload: notification.payload,
    created_at: notification.created_at ?? new Date().toISOString(),
  };
  await insert("notifications", [
    {
      ...row,
      payload: JSON.stringify(row.payload),
    } as unknown as Record<string, unknown>,
  ]);
  return row;
}

export async function getNotifications(limit = 50): Promise<Notification[]> {
  const rows = await query<{
    id: string;
    company_id: string;
    channel: string;
    status: string;
    payload: string;
    created_at: string;
  }>(`SELECT * FROM notifications ORDER BY created_at DESC LIMIT {limit:UInt32}`, {
    limit,
  });
  return rows.map((r) => ({
    ...r,
    channel: r.channel as Notification["channel"],
    status: r.status as Notification["status"],
    payload:
      typeof r.payload === "string" ? JSON.parse(r.payload) : r.payload,
  }));
}

export async function getSources(): Promise<Source[]> {
  return query<Source>(`SELECT * FROM sources`);
}

export async function getDashboardStats(): Promise<{
  totalCompanies: number;
  topScore: number;
  agentRunsToday: number;
  notificationsSent: number;
}> {
  const [companies, scores, runs, notifications] = await Promise.all([
    query<{ count: number }>(`SELECT count() as count FROM companies`),
    query<{ max_score: number }>(`SELECT max(total_score) as max_score FROM scores`),
    query<{ count: number }>(`SELECT count() as count FROM agent_runs`),
    query<{ count: number }>(`SELECT count() as count FROM notifications`),
  ]);

  return {
    totalCompanies: companies[0]?.count ?? 0,
    topScore: scores[0]?.max_score ?? 0,
    agentRunsToday: runs[0]?.count ?? 0,
    notificationsSent: notifications[0]?.count ?? 0,
  };
}
