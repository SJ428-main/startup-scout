"use client";

import { useEffect, useState, useCallback } from "react";
import { Play, RefreshCw, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AgentTimeline } from "@/components/agents/agent-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { fetchEnrichedStartups, fetchTimeline, triggerPipeline } from "@/lib/api";
import { scoreColor } from "@/lib/utils";
import { DEMO_AGENT_EVENTS } from "@/data/demoStartups";
import { getScoreBreakdown } from "@/lib/scoring";
import type { EnrichedStartup } from "@/types/enriched";

interface DemoStats {
  repos_scanned: number;
  candidates_found: number;
  companies_enriched: number;
  startups_scored: number;
  highest_score: number;
  top_category: string;
  last_pipeline_run: string;
}

const statCards = [
  { key: "repos_scanned" as const, label: "Repos Scanned", color: "text-scout-cyan", bg: "bg-scout-cyan/10", fmt: (v: number) => v.toLocaleString() },
  { key: "candidates_found" as const, label: "Candidates Found", color: "text-scout-purple", bg: "bg-scout-purple/10", fmt: (v: number) => v.toString() },
  { key: "companies_enriched" as const, label: "Profiles Enriched", color: "text-scout-amber", bg: "bg-scout-amber/10", fmt: (v: number) => v.toString() },
  { key: "startups_scored" as const, label: "Startups Scored", color: "text-scout-green", bg: "bg-scout-green/10", fmt: (v: number) => v.toString() },
  { key: "highest_score" as const, label: "Highest Score", color: "text-scout-green", bg: "bg-scout-green/10", fmt: (v: number) => v.toFixed(1) },
  { key: "top_category" as const, label: "Top Category", color: "text-scout-cyan", bg: "bg-scout-cyan/10", fmt: (v: string | number) => String(v) },
];

function minutesAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff === 1) return "1 min ago";
  return `${diff} min ago`;
}

export default function DashboardPage() {
  const [startups, setStartups] = useState<EnrichedStartup[]>([]);
  const [stats, setStats] = useState<DemoStats | null>(null);
  const [timeline, setTimeline] = useState<Array<{ id: string; company_name: string; stage: string; timestamp: string; details: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [enriched, tl] = await Promise.all([
        fetchEnrichedStartups({ sort: "score" }),
        fetchTimeline().catch(() => []),
      ]);
      setStartups(enriched.startups);
      setStats(enriched.stats as DemoStats);
      setTimeline(tl.length > 0 ? tl : DEMO_AGENT_EVENTS);
    } catch {
      // fall back to baseline timeline if the live timeline request fails
      setTimeline(DEMO_AGENT_EVENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRunPipeline() {
    setRunning(true);
    try {
      await triggerPipeline();
      await load();
    } catch {
      // pipeline trigger failed — leave existing data in place
    } finally {
      setRunning(false);
    }
  }

  const top3 = startups.slice(0, 3);
  const recent = startups.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Startup Scout analyzes public developer and product signals to surface early-stage companies with strong technical momentum.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleRunPipeline} disabled={running}>
            <Play className="h-4 w-4" />
            {running ? "Running..." : "Run Pipeline"}
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card, i) => {
            const raw = stats[card.key];
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className={`mt-1 text-xl font-bold ${card.color}`}>
                      {card.fmt(raw as never)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : null}

      {stats && (
        <p className="text-xs text-muted-foreground">
          Last pipeline run: {minutesAgo(stats.last_pipeline_run)}
        </p>
      )}

      {/* Top 3 ranked */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Top Ranked Startups</h2>
          <Link href="/ranked" className="flex items-center gap-1 text-sm text-scout-cyan hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {top3.map((s, i) => {
              const breakdown = getScoreBreakdown(s);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/startup/${s.slug}`}>
                    <Card className="group h-full border-border/50 bg-card/50 backdrop-blur transition-all hover:border-scout-cyan/30 hover:shadow-lg hover:shadow-scout-cyan/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {i === 0 && <span className="text-scout-amber text-sm">🏆</span>}
                              <CardTitle className="text-base">{s.name}</CardTitle>
                            </div>
                            <Badge variant="outline" className="mt-1 text-xs">{s.category}</Badge>
                          </div>
                          <span className={`text-2xl font-bold ${scoreColor(s.total_score)}`}>
                            {s.total_score.toFixed(1)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
                        <div className="space-y-1.5">
                          {breakdown.slice(0, 3).map((d) => (
                            <div key={d.key} className="space-y-0.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{d.label}</span>
                                <span className={d.color}>{d.score}</span>
                              </div>
                              <Progress value={d.score} className="h-1" />
                            </div>
                          ))}
                        </div>
                        <p className="flex items-center gap-1 text-xs text-scout-green">
                          <TrendingUp className="h-3 w-3" />
                          {s.explanation[0]}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent Timeline */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Agent Timeline</h2>
        {loading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : (
          <AgentTimeline events={timeline} />
        )}
      </div>

      {/* Recent Discoveries */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Discoveries</h2>
          <Link href="/discovered" className="flex items-center gap-1 text-sm text-scout-cyan hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/startup/${s.slug}`}>
                  <Card className="group border-border/50 bg-card/50 backdrop-blur transition-all hover:border-scout-cyan/30 hover:shadow-lg hover:shadow-scout-cyan/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{s.name}</p>
                          <Badge variant="outline" className="mt-0.5 text-xs">{s.category}</Badge>
                        </div>
                        <span className={`ml-2 text-lg font-bold ${scoreColor(s.total_score)}`}>
                          {s.total_score.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.source_tags.map((t) => (
                          <span key={t} className="rounded bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        Startup Scout is a research and discovery tool. Scores are based on public technical and product signals and are not financial advice.
      </p>
    </div>
  );
}
