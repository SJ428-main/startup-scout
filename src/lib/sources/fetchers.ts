import Parser from "rss-parser";
import type { SourceType } from "@/types";
import { isDemoMode } from "@/lib/config";

export interface RawDiscovery {
  name: string;
  description: string;
  website: string;
  github_url: string;
  launch_date: string;
  source_urls: string[];
  source_type: SourceType;
}

const RSS_FEEDS = [
  { url: "https://blog.langchain.dev/rss/", name: "LangChain Blog" },
  { url: "https://openai.com/blog/rss.xml", name: "OpenAI Blog" },
];

const DEMO_DISCOVERIES: RawDiscovery[] = [
  {
    name: "Pydantic AI",
    description:
      "Agent framework from the Pydantic team. Type-safe, model-agnostic AI agent development.",
    website: "https://ai.pydantic.dev",
    github_url: "https://github.com/pydantic/pydantic-ai",
    launch_date: new Date().toISOString().split("T")[0],
    source_urls: ["https://github.com/trending/python"],
    source_type: "github_trending",
  },
  {
    name: "LangGraph",
    description:
      "Build resilient language agents as graphs. Low-level orchestration framework by LangChain.",
    website: "https://langchain-ai.github.io/langgraph/",
    github_url: "https://github.com/langchain-ai/langgraph",
    launch_date: new Date().toISOString().split("T")[0],
    source_urls: ["https://news.ycombinator.com"],
    source_type: "hacker_news",
  },
  {
    name: "Dify",
    description:
      "Open-source LLM app development platform with visual workflow builder.",
    website: "https://dify.ai",
    github_url: "https://github.com/langgenius/dify",
    launch_date: new Date().toISOString().split("T")[0],
    source_urls: ["https://www.producthunt.com"],
    source_type: "product_hunt",
  },
];

const DEMO_GITHUB_STATS: Record<string, { stars: number; recentCommits: number }> = {
  "browser-use": { stars: 11200, recentCommits: 38 },
  "pydantic-ai": { stars: 9800, recentCommits: 31 },
  langgraph: { stars: 14200, recentCommits: 45 },
  dify: { stars: 42000, recentCommits: 52 },
  default: { stars: 7500, recentCommits: 22 },
};

export async function fetchGitHubTrending(): Promise<RawDiscovery[]> {
  if (isDemoMode()) {
    return DEMO_DISCOVERIES.filter((d) => d.source_type === "github_trending");
  }

  try {
    const res = await fetch(
      "https://api.github.com/search/repositories?q=AI+agent+created:>2024-01-01&sort=stars&order=desc&per_page=5",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        next: { revalidate: 900 },
      }
    );
    if (!res.ok) {
      return DEMO_DISCOVERIES.filter((d) => d.source_type === "github_trending");
    }

    const data = (await res.json()) as {
      items: Array<{
        full_name: string;
        description: string | null;
        html_url: string;
        homepage: string | null;
        created_at: string;
      }>;
    };

    return data.items.map((repo) => ({
      name: repo.full_name.split("/")[1] ?? repo.full_name,
      description: repo.description ?? "AI startup discovered on GitHub",
      website: repo.homepage ?? repo.html_url,
      github_url: repo.html_url,
      launch_date: repo.created_at.split("T")[0],
      source_urls: [repo.html_url],
      source_type: "github_trending" as SourceType,
    }));
  } catch {
    return DEMO_DISCOVERIES.filter((d) => d.source_type === "github_trending");
  }
}

export async function fetchHackerNews(): Promise<RawDiscovery[]> {
  if (isDemoMode()) {
    return DEMO_DISCOVERIES.filter((d) => d.source_type === "hacker_news");
  }

  try {
    const res = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    const ids = ((await res.json()) as number[]).slice(0, 10);
    const stories = await Promise.all(
      ids.map(async (id) => {
        const s = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return s.json() as Promise<{
          title?: string;
          url?: string;
        }>;
      })
    );

    return stories
      .filter(
        (s) =>
          s.title && /ai|agent|llm|machine learning|startup/i.test(s.title)
      )
      .slice(0, 3)
      .map((s) => ({
        name: s.title!.split(/[:\-–]/)[0].trim().slice(0, 50),
        description: s.title!,
        website: s.url ?? "https://news.ycombinator.com",
        github_url: "",
        launch_date: new Date().toISOString().split("T")[0],
        source_urls: [
          s.url ?? `https://news.ycombinator.com/item?id=${ids[0]}`,
        ],
        source_type: "hacker_news" as SourceType,
      }));
  } catch {
    return DEMO_DISCOVERIES.filter((d) => d.source_type === "hacker_news");
  }
}

export async function fetchProductHunt(): Promise<RawDiscovery[]> {
  if (isDemoMode()) {
    return DEMO_DISCOVERIES.filter((d) => d.source_type === "product_hunt");
  }
  return DEMO_DISCOVERIES.filter((d) => d.source_type === "product_hunt");
}

export async function fetchRSSFeeds(): Promise<RawDiscovery[]> {
  if (isDemoMode()) return [];

  const parser = new Parser();
  const discoveries: RawDiscovery[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of (parsed.items ?? []).slice(0, 2)) {
        discoveries.push({
          name: item.title?.slice(0, 50) ?? "Unknown",
          description: item.contentSnippet ?? item.title ?? "",
          website: item.link ?? feed.url,
          github_url: "",
          launch_date: item.pubDate
            ? new Date(item.pubDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          source_urls: [item.link ?? feed.url],
          source_type: "rss",
        });
      }
    } catch {
      // skip failed feeds
    }
  }

  return discoveries;
}

export async function fetchAllSources(): Promise<RawDiscovery[]> {
  const [github, hn, ph, rss] = await Promise.all([
    fetchGitHubTrending(),
    fetchHackerNews(),
    fetchProductHunt(),
    fetchRSSFeeds(),
  ]);

  const all = [...github, ...hn, ...ph, ...rss];
  const seen = new Set<string>();
  return all.filter((d) => {
    const key = d.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchGitHubStats(
  githubUrl: string
): Promise<{ stars: number; recentCommits: number }> {
  if (!githubUrl) {
    return DEMO_GITHUB_STATS.default;
  }

  if (isDemoMode()) {
    const slug = githubUrl.split("/").pop()?.toLowerCase() ?? "";
    for (const [key, stats] of Object.entries(DEMO_GITHUB_STATS)) {
      if (slug.includes(key)) return stats;
    }
    return DEMO_GITHUB_STATS.default;
  }

  try {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return DEMO_GITHUB_STATS.default;

    const [, owner, repo] = match;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [repoRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`,
        { headers }
      ),
    ]);

    const repoData = (await repoRes.json()) as { stargazers_count?: number };
    const commits = commitsRes.ok ? ((await commitsRes.json()) as unknown[]) : [];

    return {
      stars: repoData.stargazers_count ?? 0,
      recentCommits: commits.length,
    };
  } catch {
    return DEMO_GITHUB_STATS.default;
  }
}
