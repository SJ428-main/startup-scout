"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Microscope,
  BarChart3,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAgentRuns } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { DEMO_AGENT_EVENTS, DEMO_STATS } from "@/data/demoStartups";
import type { AgentRun, AgentType } from "@/types";

const agentMeta: Record<AgentType, { icon: typeof Search; label: string; description: string; color: string }> = {
  discovery: {
    icon: Search,
    label: "Discovery Agent",
    description: "Scans GitHub, Hacker News, Product Hunt, and RSS feeds for new startup candidates",
    color: "text-scout-cyan",
  },
  research: {
    icon: Microscope,
    label: "Research Agent",
    description: "Enriches company profiles with GitHub stats, HN mentions, and product signals",
    color: "text-scout-purple",
  },
  scoring: {
    icon: BarChart3,
    label: "Scoring Agent",
    description: "Calculates explainable 0–100 momentum scores using a 5-dimension formula",
    color: "text-scout-amber",
  },
  action: {
    icon: Zap,
    label: "Action Agent",
    description: "Generates research reports for high-scoring companies (threshold: 85+)",
    color: "text-scout-green",
  },
};

function minutesAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "just now";
  return `${diff} min ago`;
}

export default function AgentsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentRuns()
      .then(setRuns)
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  const latestByType = (["discovery", "research", "scoring", "action"] as AgentType[]).map((type) => ({
    type,
    run: runs.find((r) => r.agent_type === type),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Activity</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor autonomous agent runs and pipeline status.
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/30 px-5 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-scout-green opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-scout-green" />
        </span>
        <p className="text-sm">
          <span className="font-medium text-scout-green">4 agents operational</span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            Last pipeline run {minutesAgo(DEMO_STATS.last_pipeline_run)}
          </span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {DEMO_STATS.startups_scored} startups scored
          </span>
        </p>
      </div>

      {/* Agent cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {latestByType.map(({ type, run }, i) => {
          const meta = agentMeta[type];
          const Icon = meta.icon;
          const status = run?.status ?? "completed";

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-card ${meta.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{meta.label}</CardTitle>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        status === "completed" ? "default" :
                        status === "failed" ? "destructive" :
                        status === "running" ? "secondary" : "outline"
                      }
                    >
                      {status === "running" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {run ? (
                    <div className="flex items-center gap-4">
                      <span>Processed: {run.items_processed}</span>
                      <span>Started: {formatDate(run.started_at)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Last run: {minutesAgo(DEMO_STATS.last_pipeline_run)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent timeline events */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Recent Pipeline Events</h2>
        <div className="space-y-2">
          {DEMO_AGENT_EVENTS.map((event, i) => {
            const stageColors: Record<string, string> = {
              discovery: "text-scout-cyan",
              research: "text-scout-purple",
              scoring: "text-scout-amber",
              notification: "text-scout-green",
              report: "text-scout-cyan",
            };
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 rounded-lg border border-border/30 bg-card/20 p-4"
              >
                <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${stageColors[event.stage] ?? "text-muted-foreground"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{event.company_name}</span>
                    <Badge variant="outline" className="text-xs capitalize">{event.stage}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{event.details}</p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {minutesAgo(event.timestamp)}
                </time>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Run history */}
      {runs.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Run History</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => {
                const meta = agentMeta[run.agent_type];
                return (
                  <div
                    key={run.id}
                    className="flex items-center gap-4 rounded-lg border border-border/30 bg-card/20 p-4"
                  >
                    {run.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-scout-green" />
                    ) : run.status === "failed" ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-scout-cyan" />
                    )}
                    <div className="flex-1">
                      <span className="font-medium">{meta.label}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {run.items_processed} items
                      </span>
                    </div>
                    <time className="text-sm text-muted-foreground">
                      {formatDate(run.started_at)}
                    </time>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
