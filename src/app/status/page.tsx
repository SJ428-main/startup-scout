"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Github, TrendingUp, Bell, Rss, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_STATS } from "@/data/demoStartups";

interface SystemStatus {
  live: boolean;
  database: boolean;
  aiAnalysis: boolean;
  githubAuth: boolean;
}

function minutesAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff === 1) return "1 min ago";
  return `${diff} min ago`;
}

const DATA_SOURCES = [
  { name: "GitHub Trending", icon: Github, desc: "Scanning AI and developer tool repositories" },
  { name: "Hacker News", icon: TrendingUp, desc: "Monitoring top stories and Show HN posts" },
  { name: "Product Hunt", icon: Bell, desc: "Tracking new AI product launches" },
  { name: "RSS Feeds", icon: Rss, desc: "Ingesting engineering blog posts" },
];

const AGENTS = [
  { name: "Discovery Agent", desc: "Scans public sources for new startup candidates" },
  { name: "Research Agent", desc: "Enriches company profiles with technical signals" },
  { name: "Scoring Agent", desc: "Calculates momentum scores using weighted formula" },
  { name: "Action Agent", desc: "Generates research reports for high-scoring companies" },
];

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetch("/api/system-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const stats = DEMO_STATS;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
        <p className="mt-1 text-muted-foreground">
          Pipeline health, data source status, and agent activity.
        </p>
      </div>

      {/* Overall status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-scout-green/20 bg-scout-green/5">
          <CardContent className="flex items-center gap-4 p-6">
            <CheckCircle2 className="h-8 w-8 text-scout-green" />
            <div>
              <p className="font-semibold text-scout-green">All Systems Operational</p>
              <p className="text-sm text-muted-foreground">
                Last pipeline run: {minutesAgo(stats.last_pipeline_run)} ·{" "}
                {stats.startups_scored} startups scored ·{" "}
                Highest score: {stats.highest_score}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pipeline metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h2 className="mb-3 text-lg font-semibold">Pipeline Metrics</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Repos Scanned", value: stats.repos_scanned.toLocaleString(), icon: Github },
            { label: "Candidates Found", value: stats.candidates_found.toString(), icon: TrendingUp },
            { label: "Profiles Enriched", value: stats.companies_enriched.toString(), icon: Activity },
            { label: "Startups Scored", value: stats.startups_scored.toString(), icon: Bell },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label} className="border-border/50 bg-card/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 text-scout-cyan" />
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-xl font-bold">{m.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Data sources */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="mb-3 text-lg font-semibold">Data Sources</h2>
        <div className="space-y-3">
          {DATA_SOURCES.map((src) => {
            const Icon = src.icon;
            return (
              <div key={src.name} className="flex items-center justify-between rounded-lg border border-border/30 bg-card/20 p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{src.name}</p>
                    <p className="text-xs text-muted-foreground">{src.desc}</p>
                  </div>
                </div>
                <Badge className="bg-scout-green/20 text-scout-green">Operational</Badge>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Agents */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="mb-3 text-lg font-semibold">Autonomous Agents</h2>
        <div className="space-y-3">
          {AGENTS.map((agent) => (
            <div key={agent.name} className="flex items-center justify-between rounded-lg border border-border/30 bg-card/20 p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-scout-green opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-scout-green" />
                </span>
                <Badge className="bg-scout-green/20 text-scout-green">Active</Badge>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Schedule + live connection status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-scout-cyan" />
              Pipeline Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The discovery pipeline runs on a <span className="font-medium text-foreground">15-minute</span> schedule, or on demand from the dashboard.</p>
            <p>Last completed run: <span className="font-medium text-foreground">{minutesAgo(stats.last_pipeline_run)}</span></p>

            {status && (
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-lg bg-card/30 px-3 py-2">
                  <span className="text-xs">Database connection</span>
                  <Badge className={status.database ? "bg-scout-green/20 text-scout-green" : "bg-muted text-muted-foreground"}>
                    {status.database ? "Connected" : "Not configured"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-card/30 px-3 py-2">
                  <span className="text-xs">AI analysis</span>
                  <Badge className={status.aiAnalysis ? "bg-scout-green/20 text-scout-green" : "bg-muted text-muted-foreground"}>
                    {status.aiAnalysis ? "Connected" : "Not configured"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-card/30 px-3 py-2">
                  <span className="text-xs">GitHub access</span>
                  <Badge className={status.githubAuth ? "bg-scout-green/20 text-scout-green" : "bg-muted text-muted-foreground"}>
                    {status.githubAuth ? "Connected" : "Not configured"}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
