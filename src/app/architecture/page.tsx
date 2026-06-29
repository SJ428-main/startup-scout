"use client";

import { motion } from "framer-motion";
import { ArrowRight, Github, Rss, TrendingUp, BarChart3, Bell, Search, Microscope } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SCORE_DIMENSIONS, SCORE_WEIGHTS } from "@/lib/scoring";

const PIPELINE_STEPS = [
  { icon: Search, label: "Discovery", color: "text-scout-cyan", bg: "bg-scout-cyan/10", desc: "Scan GitHub Trending, Hacker News, Product Hunt, and RSS feeds for new AI and developer-tool startups." },
  { icon: Microscope, label: "Enrichment", color: "text-scout-purple", bg: "bg-scout-purple/10", desc: "Fetch GitHub stats, commit history, contributor counts, Hacker News mentions, and product launch data." },
  { icon: TrendingUp, label: "Signal Collection", color: "text-scout-amber", bg: "bg-scout-amber/10", desc: "Aggregate public signals: star growth, engineering velocity, community engagement, and hiring activity." },
  { icon: BarChart3, label: "Scoring", color: "text-scout-green", bg: "bg-scout-green/10", desc: "Calculate an explainable 0–100 momentum score using a transparent, weighted formula." },
  { icon: Bell, label: "Ranking", color: "text-scout-cyan", bg: "bg-scout-cyan/10", desc: "Surface top-ranked startups in the dashboard. High-scoring companies trigger research report generation." },
];

const DATA_SOURCES = [
  { icon: Github, name: "GitHub Trending", desc: "Daily trending repositories filtered for AI agents, ML infrastructure, and developer tooling.", badge: "Live" },
  { icon: TrendingUp, name: "Hacker News", desc: "Top stories and Show HN posts mentioning AI startups, filtered by keyword and point threshold.", badge: "Live" },
  { icon: Bell, name: "Product Hunt", desc: "New product launches tagged with AI, developer tools, and open-source — ranked by upvotes.", badge: "Curated" },
  { icon: Rss, name: "RSS / Blogs", desc: "Engineering blogs from LangChain, OpenAI, Anthropic, and other AI-ecosystem publishers.", badge: "Curated" },
];

const TECH_STACK = [
  { name: "Next.js 15", desc: "App Router, TypeScript, React 19, standalone Docker output" },
  { name: "ClickHouse", desc: "Columnar OLAP database for production data persistence" },
  { name: "Anthropic Claude", desc: "AI analysis of startup profiles via claude-3-5-haiku (optional)" },
  { name: "Composio", desc: "Slack, Gmail, Notion, and GitHub action integrations (optional)" },
  { name: "Tailwind CSS", desc: "Utility-first CSS with Framer Motion animations and Radix UI primitives" },
  { name: "node-cron", desc: "Background agent scheduling — pipeline runs every 15 minutes" },
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">How Startup Scout Works</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Startup Scout is an autonomous multi-agent system that continuously monitors public developer and product signals to surface early-stage companies showing strong technical momentum. Four specialized agents run in a sequential pipeline every 15 minutes.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/" className="text-sm text-scout-cyan hover:underline">← Dashboard</Link>
          <Link href="/discovered" className="text-sm text-scout-cyan hover:underline">Discovered</Link>
          <Link href="/ranked" className="text-sm text-scout-cyan hover:underline">Top Ranked</Link>
        </div>
      </motion.div>

      {/* Pipeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="mb-4 text-xl font-semibold">Agent Pipeline</h2>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-3 lg:flex-1 lg:flex-col lg:items-stretch">
                <Card className="flex-1 border-border/50 bg-card/50">
                  <CardContent className="p-4">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${step.bg}`}>
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <p className={`font-semibold ${step.color}`}>{step.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/30 lg:hidden" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Data sources */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="mb-4 text-xl font-semibold">Data Sources</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DATA_SOURCES.map((src) => {
            const Icon = src.icon;
            return (
              <Card key={src.name} className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <Icon className="h-5 w-5 text-scout-cyan" />
                    <Badge variant="outline" className="text-xs">{src.badge}</Badge>
                  </div>
                  <p className="mt-2 font-medium">{src.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{src.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Live connectors pull from the GitHub and Hacker News APIs. A curated baseline dataset fills in until the discovery pipeline has run.
        </p>
      </motion.div>

      {/* Scoring formula */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="mb-4 text-xl font-semibold">Scoring Formula</h2>
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Momentum Score (0–100)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Each dimension is independently scored 0–100 from raw signals, then weighted to produce a transparent total.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Dimension</th>
                    <th className="pb-2 text-center font-medium text-muted-foreground">Weight</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Signals Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {SCORE_DIMENSIONS.map((d) => (
                    <tr key={d.key}>
                      <td className={`py-3 font-medium ${d.color}`}>{d.label}</td>
                      <td className="py-3 text-center font-bold">{d.weight}</td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {d.key === "github_growth_score" && "Star growth (30d), total GitHub stars"}
                        {d.key === "engineering_activity_score" && "Commits (30d), contributors (90d), releases (90d)"}
                        {d.key === "community_score" && "Hacker News mentions (30d), product blog mentions (30d)"}
                        {d.key === "product_traction_score" && "Product mentions (30d), release cadence, HN engagement"}
                        {d.key === "hiring_signal_score" && "Open engineering roles detected on company career pages"}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border/50">
                    <td className="pt-3 font-bold">Total Score</td>
                    <td className="pt-3 text-center font-bold text-scout-cyan">
                      {Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0) * 100}%
                    </td>
                    <td className="pt-3 text-xs text-muted-foreground">Weighted average of all dimensions</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg bg-card/30 p-3 font-mono text-xs text-muted-foreground">
              total = (github_growth × 0.35) + (engineering × 0.25) + (community × 0.15) + (product × 0.15) + (hiring × 0.10)
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tech stack */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="mb-4 text-xl font-semibold">Tech Stack</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map((t) => (
            <Card key={t.name} className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <p className="font-medium text-scout-cyan">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="rounded-xl border border-border/30 bg-card/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Startup Scout is a research and discovery tool. Scores are based on public technical and product signals and are not financial advice. Always conduct your own due diligence before making investment decisions.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
