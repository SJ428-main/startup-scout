"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, ExternalLink, Github, MapPin, Tag,
  TrendingUp, GitCommit, Users, Package, MessageSquare, Briefcase, Star,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEnrichedStartup } from "@/lib/api";
import { scoreColor } from "@/lib/utils";
import { getScoreBreakdown } from "@/lib/scoring";
import type { EnrichedStartup } from "@/types/enriched";

const SIGNAL_METRICS = [
  { key: "star_growth_30d" as const, label: "Star growth (30d)", icon: TrendingUp, suffix: "%", color: "text-scout-cyan" },
  { key: "github_stars" as const, label: "GitHub Stars", icon: Star, suffix: "", color: "text-scout-amber" },
  { key: "commits_30d" as const, label: "Commits (30d)", icon: GitCommit, suffix: "", color: "text-scout-purple" },
  { key: "contributors_90d" as const, label: "Contributors (90d)", icon: Users, suffix: "", color: "text-scout-purple" },
  { key: "releases_90d" as const, label: "Releases (90d)", icon: Package, suffix: "", color: "text-scout-green" },
  { key: "hn_mentions_30d" as const, label: "HN Mentions (30d)", icon: MessageSquare, suffix: "", color: "text-scout-amber" },
  { key: "product_mentions_30d" as const, label: "Product Mentions (30d)", icon: Tag, suffix: "", color: "text-scout-green" },
  { key: "hiring_signals" as const, label: "Open Roles Detected", icon: Briefcase, suffix: "", color: "text-scout-cyan" },
];

export default function StartupDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [startup, setStartup] = useState<EnrichedStartup | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchEnrichedStartup(slug)
      .then(setStartup)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (notFound || !startup) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-xl font-semibold">Startup not found</p>
        <p className="mt-2 text-muted-foreground">The startup you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/discovered" className="mt-4 text-scout-cyan hover:underline">← Back to Discovered</Link>
      </div>
    );
  }

  const breakdown = getScoreBreakdown(startup);

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-4">
        <Link href="/discovered" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-scout-cyan">
          <ArrowLeft className="h-4 w-4" /> Discovered
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <Link href="/ranked" className="text-sm text-muted-foreground hover:text-scout-cyan">Top Ranked</Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-sm font-medium">{startup.name}</span>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold">{startup.name}</h1>
                  <Badge variant="outline">{startup.category}</Badge>
                  {startup.total_score >= 85 && (
                    <Badge className="bg-scout-green/20 text-scout-green">High Signal</Badge>
                  )}
                </div>
                {startup.location && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {startup.location}
                  </p>
                )}
                <p className="max-w-2xl text-muted-foreground">{startup.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {startup.github_url && (
                    <a href={startup.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-scout-cyan/30 hover:text-scout-cyan">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {startup.website_url && (
                    <a href={startup.website_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-scout-cyan/30 hover:text-scout-cyan">
                      <ExternalLink className="h-4 w-4" /> Website
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {startup.source_tags.map((t) => (
                    <span key={t} className="rounded bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="shrink-0 rounded-xl border border-border/50 bg-card/30 p-5 text-center">
                <p className="text-xs text-muted-foreground">Momentum Score</p>
                <p className={`mt-1 text-5xl font-black ${scoreColor(startup.total_score)}`}>
                  {startup.total_score.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">/ 100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Score breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total = GitHub Growth (35%) + Engineering Activity (25%) + Community (15%) + Product Traction (15%) + Hiring Signal (10%)
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {breakdown.map((d) => (
              <div key={d.key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className={`font-semibold ${d.color}`}>{d.score}</span>
                </div>
                <Progress value={d.score} className="h-2" />
                <p className="text-xs text-muted-foreground">Weight: {d.weight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Why it ranked */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Why this startup ranked highly</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {startup.explanation.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-scout-green" />
                  <span className="text-sm text-muted-foreground">{bullet}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Signal metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Public Signal Metrics</CardTitle>
            <p className="text-sm text-muted-foreground">Raw signals collected from public sources</p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SIGNAL_METRICS.map((m) => {
              const Icon = m.icon;
              const value = startup[m.key];
              return (
                <div key={m.key} className="rounded-lg border border-border/30 bg-card/30 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className={`h-4 w-4 ${m.color}`} />
                    <span className="text-xs">{m.label}</span>
                  </div>
                  <p className={`mt-1 text-2xl font-bold ${m.color}`}>
                    {value.toLocaleString()}{m.suffix}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Research notes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Research Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Category:</span> {startup.category}
            </p>
            <p>
              <span className="font-medium text-foreground">Location:</span> {startup.location || "Remote / Undisclosed"}
            </p>
            <p>
              <span className="font-medium text-foreground">Status:</span>{" "}
              <Badge variant={startup.status === "actioned" ? "default" : startup.status === "scored" ? "secondary" : "outline"}>
                {startup.status}
              </Badge>
            </p>
            <p>
              <span className="font-medium text-foreground">Sources:</span> {startup.source_tags.join(", ")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <p className="rounded-lg border border-border/30 bg-card/20 p-4 text-center text-xs text-muted-foreground">
        Startup Scout is a research and discovery tool. Scores are based on public technical and product signals and are not financial advice.
        Always conduct your own due diligence before making investment decisions.
      </p>
    </div>
  );
}
