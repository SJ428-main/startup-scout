"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Source } from "@/types";

export default function SettingsPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sources")
      .then((r) => r.json())
      .then(setSources)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const envVars = [
    { key: "DEMO_MODE", value: process.env.NEXT_PUBLIC_DEMO_MODE ?? "true" },
    { key: "CLICKHOUSE_HOST", value: "http://localhost:8123" },
    { key: "DISCOVERY_INTERVAL_MINUTES", value: "15" },
    { key: "SCORE_THRESHOLD", value: "85" },
    { key: "ANTHROPIC_API_KEY", value: "••••••••" },
    { key: "ANTHROPIC_MODEL", value: "claude-3-5-haiku-20241022" },
    { key: "COMPOSIO_API_KEY", value: "••••••••" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Data sources and configuration
        </p>
      </div>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))
          ) : (
            sources.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border/30 p-3"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.url}</p>
                </div>
                <Badge variant={s.enabled ? "default" : "outline"}>
                  {s.enabled ? "enabled" : "disabled"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {envVars.map((v) => (
            <div
              key={v.key}
              className="flex items-center justify-between rounded-lg bg-card/30 px-3 py-2 font-mono text-sm"
            >
              <span className="text-scout-cyan">{v.key}</span>
              <span className="text-muted-foreground">{v.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Integration Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Composio integrations (Slack, Gmail, Notion, GitHub) run in{" "}
            <Badge variant="secondary">mock mode</Badge> by default. Add API
            keys in <code className="text-scout-cyan">.env</code> to enable live
            actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
