"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTopScores } from "@/lib/api";
import { scoreColor } from "@/lib/utils";
import type { StartupScore } from "@/types";

export default function RankedPage() {
  const [scores, setScores] = useState<
    (StartupScore & { company_name?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopScores()
      .then(setScores)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const dimensions = [
    { key: "github_activity" as const, label: "GitHub" },
    { key: "community_interest" as const, label: "Community" },
    { key: "recent_launches" as const, label: "Launches" },
    { key: "hiring_signal" as const, label: "Hiring" },
    { key: "technical_innovation" as const, label: "Innovation" },
    { key: "momentum" as const, label: "Momentum" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Ranked</h1>
        <p className="mt-1 text-muted-foreground">
          Startups scored by the autonomous Scoring Agent
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {scores.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {i === 0 && (
                        <Trophy className="h-5 w-5 text-scout-amber" />
                      )}
                      <CardTitle>{s.company_name ?? "Unknown"}</CardTitle>
                      {s.triggered_action && (
                        <Badge className="bg-scout-green/20 text-scout-green">
                          Action Triggered
                        </Badge>
                      )}
                    </div>
                    <span
                      className={`text-3xl font-bold ${scoreColor(s.total_score)}`}
                    >
                      {s.total_score.toFixed(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {dimensions.map((d) => (
                      <div key={d.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {d.label}
                          </span>
                          <span>{s[d.key]}</span>
                        </div>
                        <Progress value={s[d.key]} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                  {s.total_score >= 85 && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-scout-green">
                      <TrendingUp className="h-4 w-4" />
                      Exceeds threshold — Composio actions executed
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
