import type { AgentRun, Company, Notification, StartupScore } from "@/types";
import type { EnrichedStartup } from "@/types/enriched";

const base = "";

export async function fetchStats() {
  const res = await fetch(`${base}/api/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json() as Promise<{
    totalCompanies: number;
    topScore: number;
    agentRunsToday: number;
    notificationsSent: number;
  }>;
}

export async function fetchCompanies(): Promise<
  (Company & { score?: number })[]
> {
  const res = await fetch(`${base}/api/companies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
}

export async function fetchTopScores(): Promise<
  (StartupScore & { company_name?: string })[]
> {
  const res = await fetch(`${base}/api/scores`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch scores");
  return res.json();
}

export async function fetchAgentRuns(): Promise<AgentRun[]> {
  const res = await fetch(`${base}/api/agents`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch agent runs");
  return res.json();
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${base}/api/notifications`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function fetchTimeline() {
  const res = await fetch(`${base}/api/timeline`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch timeline");
  return res.json() as Promise<
    Array<{
      id: string;
      company_name: string;
      stage: string;
      timestamp: string;
      details: string;
    }>
  >;
}

export async function triggerPipeline() {
  const res = await fetch(`${base}/api/agents`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger pipeline");
  return res.json();
}

export async function fetchEnrichedStartups(params?: {
  q?: string;
  category?: string;
  source?: string;
  minScore?: string;
  sort?: string;
}): Promise<{ startups: EnrichedStartup[]; stats: Record<string, unknown> }> {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== "")
    ) as Record<string, string>
  ).toString();
  const res = await fetch(`${base}/api/enriched${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch enriched startups");
  return res.json();
}

export async function fetchEnrichedStartup(slug: string): Promise<EnrichedStartup> {
  const res = await fetch(`${base}/api/enriched/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}
