"use client";

import { motion } from "framer-motion";
import {
  Search,
  Microscope,
  BarChart3,
  Bell,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  company_name: string;
  stage: string;
  timestamp: string;
  details: string;
}

const stageConfig: Record<
  string,
  { icon: typeof Search; label: string; color: string }
> = {
  discovery: { icon: Search, label: "Discovery", color: "text-scout-cyan" },
  research: { icon: Microscope, label: "Research", color: "text-scout-purple" },
  scoring: { icon: BarChart3, label: "Scoring", color: "text-scout-amber" },
  notification: { icon: Bell, label: "Notification", color: "text-scout-green" },
  report: { icon: FileText, label: "Report Generated", color: "text-scout-cyan" },
};

const pipelineStages = [
  "discovery",
  "research",
  "scoring",
  "notification",
  "report",
];

export function AgentTimeline({ events }: { events: TimelineEvent[] }) {
  const latestCompany = events[0]?.company_name;
  const companyEvents = events.filter(
    (e) => e.company_name === latestCompany
  );

  return (
    <div className="space-y-6">
      {/* Pipeline visualization */}
      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/30 p-6">
        {pipelineStages.map((stage, i) => {
          const config = stageConfig[stage];
          const Icon = config.icon;
          const completed = companyEvents.some((e) => e.stage === stage);

          return (
            <div key={stage} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                    completed
                      ? "border-scout-cyan bg-scout-cyan/20 animate-pulse-glow"
                      : "border-border bg-card"
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className={cn("h-5 w-5", config.color)} />
                  ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    completed ? config.color : "text-muted-foreground"
                  )}
                >
                  {config.label}
                </span>
              </motion.div>
              {i < pipelineStages.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 w-8 sm:w-16",
                    completed ? "bg-scout-cyan" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Event log */}
      <div className="space-y-3">
        {events.slice(0, 10).map((event, i) => {
          const config = stageConfig[event.stage] ?? stageConfig.discovery;
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-lg border border-border/30 bg-card/20 p-3"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card",
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {event.company_name}
                  </span>
                  <span className={cn("text-xs", config.color)}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{event.details}</p>
              </div>
              <time className="shrink-0 text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleTimeString()}
              </time>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
