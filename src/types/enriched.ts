export interface EnrichedStartup {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  location: string;
  website_url: string | null;
  github_url: string | null;
  source_tags: string[];
  // Scores (0-100)
  total_score: number;
  github_growth_score: number;        // 35% weight
  engineering_activity_score: number; // 25% weight
  community_score: number;            // 15% weight
  product_traction_score: number;     // 15% weight
  hiring_signal_score: number;        // 10% weight
  // Raw signals
  star_growth_30d: number;
  commits_30d: number;
  contributors_90d: number;
  releases_90d: number;
  hn_mentions_30d: number;
  product_mentions_30d: number;
  hiring_signals: number;
  github_stars: number;
  // Meta
  last_seen_at: string;
  explanation: string[];
  status: "discovered" | "researched" | "scored" | "actioned";
}
