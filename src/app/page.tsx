"use client";

import { useEffect, useState } from "react";
import { Play, RefreshCw } from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StartupCard } from "@/components/startup/startup-card";
import { AgentTimeline } from "@/components/agents/agent-timeline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchStats,
  fetchCompanies,
  fetchTimeline,
  triggerPipeline,
} from "@/lib/api";
import type { Company } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    topScore: 0,
    agentRunsToday: 0,
    notificationsSent: 0,
  });
  const [companies, setCompanies] = useState<(Company & { score?: number })[]>(
    []
  );
  const [timeline, setTimeline] = useState<
    Array<{
      id: string;
      company_name: string;
      stage: string;
      timestamp: string;
      details: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [s, c, t] = await Promise.all([
        fetchStats(),
        fetchCompanies(),
        fetchTimeline(),
      ]);
      setStats(s);
      setCompanies(c.slice(0, 6));
      setTimeline(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunPipeline() {
    setRunning(true);
    try {
      await triggerPipeline();
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Autonomous startup discovery & analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={handleRunPipeline} disabled={running}>
            <Play className="h-4 w-4" />
            {running ? "Running..." : "Run Pipeline"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsCards stats={stats} />
      )}

      <div>
        <h2 className="mb-4 text-xl font-semibold">Agent Timeline</h2>
        {loading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : (
          <AgentTimeline events={timeline} />
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Discoveries</h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c, i) => (
              <StartupCard
                key={c.id}
                company={c}
                score={c.score}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
