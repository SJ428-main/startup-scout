"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, SlidersHorizontal, ExternalLink, Github, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEnrichedStartups } from "@/lib/api";
import { scoreColor } from "@/lib/utils";
import { ALL_CATEGORIES, ALL_SOURCES } from "@/data/demoStartups";
import type { EnrichedStartup } from "@/types/enriched";

const SORT_OPTIONS = [
  { value: "score", label: "Highest Score" },
  { value: "github_growth", label: "GitHub Growth" },
  { value: "engineering", label: "Engineering Activity" },
  { value: "newest", label: "Most Recent" },
];

const SCORE_FILTERS = [
  { value: "", label: "All Scores" },
  { value: "50", label: "50+" },
  { value: "70", label: "70+" },
  { value: "80", label: "80+" },
  { value: "90", label: "90+" },
];

export default function DiscoveredPage() {
  const [startups, setStartups] = useState<EnrichedStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sort, setSort] = useState("score");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchEnrichedStartups({ q, category, source, minScore, sort });
      setStartups(result.startups);
    } finally {
      setLoading(false);
    }
  }, [q, category, source, minScore, sort]);

  useEffect(() => {
    const timer = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, q]);

  const hasFilters = q || category || source || minScore;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discovered Startups</h1>
        <p className="mt-1 text-muted-foreground">
          Public technical signals analyzed across GitHub, Hacker News, Product Hunt, and developer blogs.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, description, or category…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-card/50 py-2 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-scout-cyan/50 focus:ring-1 focus:ring-scout-cyan/30"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm outline-none focus:border-scout-cyan/50"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm outline-none focus:border-scout-cyan/50"
          >
            <option value="">All Sources</option>
            {ALL_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm outline-none focus:border-scout-cyan/50"
          >
            {SCORE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm outline-none focus:border-scout-cyan/50"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setQ(""); setCategory(""); setSource(""); setMinScore(""); setSort("score"); }}
              className="text-xs text-scout-cyan hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{startups.length}</span> startup{startups.length !== 1 ? "s" : ""}
          {hasFilters ? " matching your filters" : ""}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : startups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/20 py-16">
          <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">No startups match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or clearing filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {startups.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Link href={`/startup/${s.slug}`}>
                <Card className="group h-full border-border/50 bg-card/50 backdrop-blur transition-all hover:border-scout-cyan/30 hover:shadow-lg hover:shadow-scout-cyan/5">
                  <CardContent className="p-5">
                    {/* Name + score */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{s.name}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">{s.category}</Badge>
                          {s.location && (
                            <span className="text-xs text-muted-foreground">{s.location}</span>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xl font-bold ${scoreColor(s.total_score)}`}>
                        {s.total_score.toFixed(1)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {s.description}
                    </p>

                    {/* Key metrics */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-scout-green" />
                        {s.star_growth_30d}% growth
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-scout-purple" />
                        {s.contributors_90d} contributors
                      </span>
                    </div>

                    {/* Sources + links */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {s.source_tags.map((t) => (
                          <span key={t} className="rounded bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground">{t}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {s.github_url && (
                          <a href={s.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-scout-cyan">
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {s.website_url && (
                          <a href={s.website_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-scout-cyan">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Startup Scout is a research and discovery tool. Scores are based on public technical and product signals and are not financial advice.
      </p>
    </div>
  );
}
