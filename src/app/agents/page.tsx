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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAgentRuns } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AgentRun, AgentType } from "@/types";

const agentMeta: Record<
  AgentType,
  { icon: typeof Search; label: string; description: string; color: string }
> = {
  discovery: {
    icon: Search,
    label: "Discovery Agent",
    description: "Scans GitHub, HN, Product Hunt, RSS every 15 min",
    color: "text-scout-cyan",
  },
  research: {
    icon: Microscope,
    label: "Research Agent",
    description: "Deep analysis of discovered startups",
    color: "text-scout-purple",
  },
  scoring: {
    icon: BarChart3,
    label: "Scoring Agent",
    description: "Computes 0-100 startup score from signals",
    color: "text-scout-amber",
  },
  action: {
    icon: Zap,
    label: "Action Agent",
    description: "Triggers Composio integrations for score > 85",
    color: "text-scout-green",
  },
};

export default function AgentsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentRuns()
      .then(setRuns)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const latestByType = (["discovery", "research", "scoring", "action"] as AgentType[]).map(
    (type) => ({
      type,
      run: runs.find((r) => r.agent_type === type),
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Activity</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor autonomous agent runs and status
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {latestByType.map(({ type, run }, i) => {
          const meta = agentMeta[type];
          const Icon = meta.icon;
          const status = run?.status ?? "idle";

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
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-card ${meta.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {meta.label}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {meta.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        status === "completed"
                          ? "default"
                          : status === "failed"
                            ? "destructive"
                            : status === "running"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {status === "running" && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      {status}
                    </Badge>
                  </div>
                </CardHeader>
                {run && (
                  <CardContent className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Processed: {run.items_processed}</span>
                      <span>Started: {formatDate(run.started_at)}</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Run History</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
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
    </div>
  );
}
