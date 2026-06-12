"use client";

import { useEffect, useState } from "react";
import { StartupCard } from "@/components/startup/startup-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCompanies } from "@/lib/api";
import type { Company } from "@/types";

export default function DiscoveredPage() {
  const [companies, setCompanies] = useState<
    (Company & { score?: number })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies()
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Discovered Startups
        </h1>
        <p className="mt-1 text-muted-foreground">
          {companies.length} AI startups found across all sources
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c, i) => (
            <StartupCard key={c.id} company={c} score={c.score} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
