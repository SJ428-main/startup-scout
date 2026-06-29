"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEnrichedStartups } from "@/lib/api";
import { scoreColor } from "@/lib/utils";
import { getScoreBreakdown } from "@/lib/scoring";
import { ALL_CATEGORIES } from "@/data/demoStartups";
import type { EnrichedStartup } from "@/types/enriched";

export default function RankedPage() {
  const [startups, setStartups] = useState<EnrichedStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    fetchEnrichedStartups({ sort: "score", category: activeCategory })
      .then((r) => setStartups(r.startups))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Ranked</h1>
        <p className="mt-1 text-muted-foreground">
          Rankings based on GitHub growth, engineering activity, community engagement, product traction, and hiring signals.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveCategory(""); setLoading(true); }}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
            activeCategory === ""
              ? "bg-scout-cyan/20 text-scout-cyan"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setLoading(true); }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-scout-cyan/20 text-scout-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ranked list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {startups.map((s, i) => {
            const breakdown = getScoreBreakdown(s);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.6) }}
              >
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 text-2xl font-black ${i === 0 ? "text-scout-amber" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-scout-amber/60" : "text-muted-foreground/50"}`}>
                          {i === 0 ? <Trophy className="h-6 w-6 text-scout-amber" /> : `#${i + 1}`}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-lg">{s.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">{s.category}</Badge>
                            {s.total_score >= 85 && (
                              <Badge className="bg-scout-green/20 text-scout-green text-xs">High Signal</Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{s.location}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-3xl font-bold ${scoreColor(s.total_score)}`}>
                          {s.total_score.toFixed(1)}
                        </span>
                        <p className="text-xs text-muted-foreground">/ 100</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{s.description}</p>

                    {/* Score breakdown */}
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      {breakdown.map((d) => (
                        <div key={d.key} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{d.label}</span>
                            <span className={d.color}>{d.score}</span>
                          </div>
                          <Progress value={d.score} className="h-1.5" />
                          <p className="text-xs text-muted-foreground">{d.weight}</p>
                        </div>
                      ))}
                    </div>

                    {/* Why it ranked */}
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Why this ranked highly</p>
                      <ul className="space-y-1">
                        {s.explanation.slice(0, 3).map((bullet, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-scout-green" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {s.source_tags.map((t) => (
                          <span key={t} className="rounded bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground">{t}</span>
                        ))}
                      </div>
                      <Link
                        href={`/startup/${s.slug}`}
                        className="flex items-center gap-1 text-xs text-scout-cyan hover:underline"
                      >
                        View details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Rankings based on public technical signals. Scores are not financial advice.
      </p>
    </div>
  );
}
