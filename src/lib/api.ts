import type { AgentRun, Company, Notification, StartupScore } from "@/types";

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
