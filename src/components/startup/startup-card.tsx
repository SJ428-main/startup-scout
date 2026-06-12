"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scoreColor } from "@/lib/utils";
import type { Company } from "@/types";

interface StartupCardProps {
  company: Company;
  score?: number;
  index?: number;
}

export function StartupCard({ company, score, index = 0 }: StartupCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group border-border/50 bg-card/50 backdrop-blur transition-all hover:border-scout-cyan/30 hover:shadow-lg hover:shadow-scout-cyan/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{company.name}</CardTitle>
            {score !== undefined && (
              <div className={`text-2xl font-bold ${scoreColor(score)}`}>
                {score.toFixed(1)}
              </div>
            )}
          </div>
          <Badge variant="outline" className="w-fit text-xs">
            {company.source_type.replace(/_/g, " ")}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {company.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {company.github_url && (
              <a
                href={company.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-scout-cyan"
              >
                <Github className="h-3 w-3" />
                GitHub
              </a>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-scout-cyan"
              >
                <ExternalLink className="h-3 w-3" />
                Website
              </a>
            )}
            <Badge
              variant={
                company.status === "actioned"
                  ? "default"
                  : company.status === "scored"
                    ? "secondary"
                    : "outline"
              }
              className="ml-auto"
            >
              {company.status}
            </Badge>
          </div>
          {score !== undefined && score >= 85 && (
            <div className="flex items-center gap-1 text-xs text-scout-green">
              <Star className="h-3 w-3 fill-current" />
              High-priority — actions triggered
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
