import { initDemoStore } from "./store";
import type {
  AgentRun,
  Company,
  Notification,
  ResearchAnalysis,
  Source,
  StartupScore,
} from "@/types";

/** Stable IDs so the published demo is consistent across deploys. */
const IDS = {
  crewai: "a1000000-0000-4000-8000-000000000001",
  mem0: "a1000000-0000-4000-8000-000000000002",
  firecrawl: "a1000000-0000-4000-8000-000000000003",
  browserUse: "a1000000-0000-4000-8000-000000000004",
} as const;

function uid(): string {
  return crypto.randomUUID();
}

export function seedDemoData(): void {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const companies: Company[] = [
    {
      id: IDS.crewai,
      name: "CrewAI",
      description:
        "Framework for orchestrating role-playing autonomous AI agents.",
      website: "https://crewai.com",
      github_url: "https://github.com/crewAIInc/crewAI",
      launch_date: today,
      source_urls: [
        "https://github.com/trending",
        "https://news.ycombinator.com",
      ],
      source_type: "github_trending",
      discovered_at: now,
      status: "actioned",
    },
    {
      id: IDS.mem0,
      name: "Mem0",
      description:
        "Memory layer for AI agents with personalized, self-improving memory.",
      website: "https://mem0.ai",
      github_url: "https://github.com/mem0ai/mem0",
      launch_date: today,
      source_urls: ["https://news.ycombinator.com"],
      source_type: "hacker_news",
      discovered_at: now,
      status: "scored",
    },
    {
      id: IDS.firecrawl,
      name: "Firecrawl",
      description: "Turn any website into LLM-ready markdown for AI agents.",
      website: "https://firecrawl.dev",
      github_url: "https://github.com/mendableai/firecrawl",
      launch_date: today,
      source_urls: ["https://www.producthunt.com"],
      source_type: "product_hunt",
      discovered_at: now,
      status: "researched",
    },
    {
      id: IDS.browserUse,
      name: "Browser Use",
      description:
        "Make websites accessible for AI agents via browser automation.",
      website: "https://browser-use.com",
      github_url: "https://github.com/browser-use/browser-use",
      launch_date: today,
      source_urls: ["https://blog.langchain.dev"],
      source_type: "ai_blog",
      discovered_at: now,
      status: "discovered",
    },
  ];

  const research: ResearchAnalysis[] = companies.slice(0, 3).map((c, i) => ({
    id: uid(),
    company_id: c.id,
    summary: `${c.name} is a fast-growing AI startup with strong open-source traction.`,
    strengths: [
      "Rapid GitHub growth",
      "Active community",
      "Clear product vision",
    ],
    risks: ["Early-stage funding", "Competitive market"],
    market: "Enterprise AI automation",
    technology: "LLM orchestration, Python/TypeScript",
    github_stars: [18500, 8200, 12400][i],
    recent_commits: [42, 28, 35][i],
    hn_points: [412, 287, 356][i],
    ph_ranking: i === 2 ? 3 : null,
    funding_news: "Series A rumored",
    hiring_page: `${c.website}/careers`,
    analyzed_at: now,
  }));

  const scores: StartupScore[] = companies.slice(0, 2).map((c, i) => ({
    id: uid(),
    company_id: c.id,
    total_score: [92.4, 78.1][i],
    github_activity: [88, 72][i],
    community_interest: [82, 65][i],
    recent_launches: [90, 55][i],
    hiring_signal: [75, 60][i],
    technical_innovation: [85, 70][i],
    momentum: [94, 68][i],
    scored_at: now,
    triggered_action: i === 0,
  }));

  const agent_runs: AgentRun[] = (
    ["discovery", "research", "scoring", "action"] as const
  ).map((type, i) => ({
    id: uid(),
    agent_type: type,
    status: "completed" as const,
    started_at: now,
    completed_at: now,
    items_processed: [4, 3, 2, 4][i],
    error_message: null,
    metadata: {},
  }));

  const notifications: Notification[] = (
    ["slack", "gmail", "notion", "github"] as const
  ).map((channel) => ({
    id: uid(),
    company_id: IDS.crewai,
    channel,
    status: "mock" as const,
    payload: { message: `CrewAI scored 92.4 via ${channel}` },
    created_at: now,
  }));

  const sources: Source[] = [
    {
      id: uid(),
      name: "GitHub Trending",
      type: "github_trending",
      url: "https://github.com/trending",
      enabled: true,
      last_fetched_at: now,
    },
    {
      id: uid(),
      name: "Hacker News",
      type: "hacker_news",
      url: "https://news.ycombinator.com",
      enabled: true,
      last_fetched_at: now,
    },
    {
      id: uid(),
      name: "Product Hunt",
      type: "product_hunt",
      url: "https://www.producthunt.com",
      enabled: true,
      last_fetched_at: now,
    },
    {
      id: uid(),
      name: "LangChain Blog",
      type: "rss",
      url: "https://blog.langchain.dev/rss/",
      enabled: true,
      last_fetched_at: now,
    },
    {
      id: uid(),
      name: "OpenAI Blog",
      type: "ai_blog",
      url: "https://openai.com/blog/rss.xml",
      enabled: true,
      last_fetched_at: now,
    },
  ];

  const timeline = [
    {
      id: uid(),
      company_id: IDS.crewai,
      company_name: "CrewAI",
      stage: "discovery",
      timestamp: now,
      details: "Discovered from GitHub Trending",
    },
    {
      id: uid(),
      company_id: IDS.crewai,
      company_name: "CrewAI",
      stage: "research",
      timestamp: now,
      details: "Analyzed: 18,500 stars",
    },
    {
      id: uid(),
      company_id: IDS.crewai,
      company_name: "CrewAI",
      stage: "scoring",
      timestamp: now,
      details: "Score: 92.4/100 — Action triggered!",
    },
    {
      id: uid(),
      company_id: IDS.crewai,
      company_name: "CrewAI",
      stage: "notification",
      timestamp: now,
      details: "Sent 4 notifications via Composio",
    },
    {
      id: uid(),
      company_id: IDS.crewai,
      company_name: "CrewAI",
      stage: "report",
      timestamp: now,
      details: "Generated cited.md",
    },
  ];

  initDemoStore({
    companies,
    research,
    scores,
    agent_runs,
    notifications,
    sources,
    timeline,
  });
}
