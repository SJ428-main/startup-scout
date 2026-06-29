"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, FileText, Github, Activity, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNotifications, fetchAgentRuns } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { DEMO_AGENT_EVENTS } from "@/data/demoStartups";
import type { Notification, AgentRun } from "@/types";

const channelIcons = {
  slack: Bell,
  gmail: Mail,
  notion: FileText,
  github: Github,
};

const CHANNEL_LABELS: Record<string, string> = {
  slack: "Slack",
  gmail: "Gmail",
  notion: "Notion",
  github: "GitHub",
};

function summarizePayload(payload: Record<string, unknown>): string {
  if (typeof payload.message === "string") return payload.message.slice(0, 120);
  if (typeof payload.subject === "string") return payload.subject;
  if (typeof payload.title === "string") return payload.title;
  if (typeof payload.note === "string") return payload.note;
  return "Notification dispatched";
}

export default function LogsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchNotifications(), fetchAgentRuns()])
      .then(([n, r]) => { setNotifications(n); setRuns(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const notifLogs = notifications.map((n) => {
    const Icon = channelIcons[n.channel] ?? Bell;
    return {
      id: n.id,
      type: "notification" as const,
      icon: Icon,
      message: `${CHANNEL_LABELS[n.channel] ?? n.channel} · ${n.status}`,
      detail: summarizePayload(n.payload),
      timestamp: n.created_at,
      status: n.status,
    };
  });

  const runLogs = runs.map((r) => ({
    id: r.id,
    type: "agent" as const,
    icon: Activity,
    message: `${r.agent_type} agent · ${r.status}`,
    detail: r.error_message ?? `${r.items_processed} items processed`,
    timestamp: r.started_at,
    status: r.status,
  }));

  const demoLogs = DEMO_AGENT_EVENTS.map((e) => ({
    id: e.id,
    type: "agent" as const,
    icon: Activity,
    message: `${e.stage} · completed`,
    detail: e.details,
    timestamp: e.timestamp,
    status: "completed",
  }));

  const logs = [...notifLogs, ...runLogs, ...(notifLogs.length === 0 && runLogs.length === 0 ? demoLogs : [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
        <p className="mt-1 text-muted-foreground">
          Agent pipeline events and notification activity.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const Icon = log.icon;
            const isSuccess = log.status === "completed" || log.status === "sent" || log.status === "mock";
            const isFailed = log.status === "failed";
            return (
              <Card key={log.id} className="border-border/30 bg-card/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex items-center gap-2 shrink-0">
                    {isSuccess ? (
                      <CheckCircle2 className="h-4 w-4 text-scout-green" />
                    ) : isFailed ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <Badge
                    variant={log.type === "notification" ? "default" : "secondary"}
                    className="shrink-0 text-xs"
                  >
                    {log.type}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="truncate text-xs text-muted-foreground">{log.detail}</p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </time>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
