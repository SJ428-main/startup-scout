"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, FileText, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNotifications, fetchAgentRuns } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Notification, AgentRun } from "@/types";

const channelIcons = {
  slack: Bell,
  gmail: Mail,
  notion: FileText,
  github: Github,
};

export default function LogsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchNotifications(), fetchAgentRuns()])
      .then(([n, r]) => {
        setNotifications(n);
        setRuns(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const logs = [
    ...notifications.map((n) => ({
      id: n.id,
      type: "notification" as const,
      message: `${n.channel} — ${n.status}`,
      timestamp: n.created_at,
      detail: JSON.stringify(n.payload).slice(0, 100),
    })),
    ...runs.map((r) => ({
      id: r.id,
      type: "agent" as const,
      message: `${r.agent_type} agent — ${r.status}`,
      timestamp: r.started_at,
      detail: r.error_message ?? `${r.items_processed} items processed`,
    })),
  ].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
        <p className="mt-1 text-muted-foreground">
          Agent runs and notification history
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
          {logs.map((log) => (
            <Card key={log.id} className="border-border/30 bg-card/20">
              <CardContent className="flex items-center gap-4 p-4">
                <Badge
                  variant={log.type === "notification" ? "default" : "secondary"}
                >
                  {log.type}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{log.message}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {log.detail}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(log.timestamp)}
                </time>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
