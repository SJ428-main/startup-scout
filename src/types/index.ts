export type SourceType =
  | "github_trending"
  | "hacker_news"
  | "product_hunt"
  | "rss"
  | "ai_blog";

export type AgentType = "discovery" | "research" | "scoring" | "action";

export type AgentStatus = "idle" | "running" | "completed" | "failed";

export type NotificationChannel = "slack" | "gmail" | "notion" | "github";

export interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  github_url: string;
  launch_date: string;
  source_urls: string[];
  source_type: SourceType;
  discovered_at: string;
  status: "discovered" | "researched" | "scored" | "actioned";
}

export interface ResearchAnalysis {
  id: string;
  company_id: string;
  summary: string;
  strengths: string[];
  risks: string[];
  market: string;
  technology: string;
  github_stars: number;
  recent_commits: number;
  hn_points: number;
  ph_ranking: number | null;
  funding_news: string;
  hiring_page: string;
  analyzed_at: string;
}

export interface StartupScore {
  id: string;
  company_id: string;
  total_score: number;
  github_activity: number;
  community_interest: number;
  recent_launches: number;
  hiring_signal: number;
  technical_innovation: number;
  momentum: number;
  scored_at: string;
  triggered_action: boolean;
}

export interface AgentRun {
  id: string;
  agent_type: AgentType;
  status: AgentStatus;
  started_at: string;
  completed_at: string | null;
  items_processed: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
}

export interface Notification {
  id: string;
  company_id: string;
  channel: NotificationChannel;
  status: "pending" | "sent" | "failed" | "mock";
  payload: Record<string, unknown>;
  created_at: string;
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  enabled: boolean;
  last_fetched_at: string | null;
}

export interface AgentTimelineEvent {
  id: string;
  company_id: string;
  company_name: string;
  stage: "discovery" | "research" | "scoring" | "notification" | "report";
  timestamp: string;
  details: string;
}

