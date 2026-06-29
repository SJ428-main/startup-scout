export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  launch_date DATE,
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  source_type TEXT NOT NULL DEFAULT 'github_trending',
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'discovered'
);

CREATE TABLE IF NOT EXISTS research (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  summary TEXT NOT NULL DEFAULT '',
  strengths TEXT[] NOT NULL DEFAULT '{}',
  risks TEXT[] NOT NULL DEFAULT '{}',
  market TEXT NOT NULL DEFAULT '',
  technology TEXT NOT NULL DEFAULT '',
  github_stars INTEGER NOT NULL DEFAULT 0,
  recent_commits INTEGER NOT NULL DEFAULT 0,
  hn_points INTEGER NOT NULL DEFAULT 0,
  ph_ranking INTEGER,
  funding_news TEXT NOT NULL DEFAULT '',
  hiring_page TEXT NOT NULL DEFAULT '',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  total_score REAL NOT NULL DEFAULT 0,
  github_activity REAL NOT NULL DEFAULT 0,
  community_interest REAL NOT NULL DEFAULT 0,
  recent_launches REAL NOT NULL DEFAULT 0,
  hiring_signal REAL NOT NULL DEFAULT 0,
  technical_innovation REAL NOT NULL DEFAULT 0,
  momentum REAL NOT NULL DEFAULT 0,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered_action BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  agent_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  items_processed INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_fetched_at TIMESTAMPTZ
);

INSERT INTO sources (id, name, type, url, enabled) VALUES
  ('src-github', 'GitHub Trending', 'github_trending', 'https://github.com/trending', TRUE),
  ('src-hn',     'Hacker News',    'hacker_news',     'https://news.ycombinator.com', TRUE),
  ('src-ph',     'Product Hunt',   'product_hunt',    'https://www.producthunt.com', TRUE),
  ('src-rss',    'LangChain Blog', 'rss',             'https://blog.langchain.dev/rss/', TRUE),
  ('src-openai', 'OpenAI Blog',    'ai_blog',         'https://openai.com/blog/rss.xml', TRUE)
ON CONFLICT (id) DO NOTHING;
`;
