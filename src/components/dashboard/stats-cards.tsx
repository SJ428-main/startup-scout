"use client";

import { motion } from "framer-motion";
import { Building2, Trophy, Bot, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    totalCompanies: number;
    topScore: number;
    agentRunsToday: number;
    notificationsSent: number;
  };
}

const cards = [
  {
    key: "totalCompanies" as const,
    label: "Discovered",
    icon: Building2,
    color: "text-scout-cyan",
    bg: "bg-scout-cyan/10",
  },
  {
    key: "topScore" as const,
    label: "Top Score",
    icon: Trophy,
    color: "text-scout-amber",
    bg: "bg-scout-amber/10",
  },
  {
    key: "agentRunsToday" as const,
    label: "Agent Runs",
    icon: Bot,
    color: "text-scout-purple",
    bg: "bg-scout-purple/10",
  },
  {
    key: "notificationsSent" as const,
    label: "Actions Taken",
    icon: Bell,
    color: "text-scout-green",
    bg: "bg-scout-green/10",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}
              >
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">
                  {card.key === "topScore"
                    ? stats[card.key].toFixed(1)
                    : stats[card.key]}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
