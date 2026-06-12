export const INIT_SQL = `
CREATE DATABASE IF NOT EXISTS startup_scout;

CREATE TABLE IF NOT EXISTS startup_scout.companies (
  id String,
  name String,
  description String,
  website String,
  github_url String,
  launch_date Date,
  source_urls Array(String),
  source_type LowCardinality(String),
  discovered_at DateTime64(3),
  status LowCardinality(String) DEFAULT 'discovered'
) ENGINE = MergeTree()
ORDER BY (discovered_at, id);

CREATE TABLE IF NOT EXISTS startup_scout.articles (
  id String,
  company_id String,
  title String,
  url String,
  source String,
  published_at DateTime64(3),
  snippet String
) ENGINE = MergeTree()
ORDER BY (published_at, id);

CREATE TABLE IF NOT EXISTS startup_scout.scores (
  id String,
  company_id String,
  total_score Float32,
  github_activity Float32,
  community_interest Float32,
  recent_launches Float32,
  hiring_signal Float32,
  technical_innovation Float32,
  momentum Float32,
  scored_at DateTime64(3),
  triggered_action UInt8 DEFAULT 0
) ENGINE = MergeTree()
ORDER BY (scored_at, company_id);

CREATE TABLE IF NOT EXISTS startup_scout.agent_runs (
  id String,
  agent_type LowCardinality(String),
  status LowCardinality(String),
  started_at DateTime64(3),
  completed_at Nullable(DateTime64(3)),
  items_processed UInt32 DEFAULT 0,
  error_message Nullable(String),
  metadata String DEFAULT '{}'
) ENGINE = MergeTree()
ORDER BY (started_at, id);

CREATE TABLE IF NOT EXISTS startup_scout.notifications (
  id String,
  company_id String,
  channel LowCardinality(String),
  status LowCardinality(String),
  payload String,
  created_at DateTime64(3)
) ENGINE = MergeTree()
ORDER BY (created_at, id);

CREATE TABLE IF NOT EXISTS startup_scout.sources (
  id String,
  name String,
  type LowCardinality(String),
  url String,
  enabled UInt8 DEFAULT 1,
  last_fetched_at Nullable(DateTime64(3))
) ENGINE = MergeTree()
ORDER BY (type, id);

CREATE TABLE IF NOT EXISTS startup_scout.research (
  id String,
  company_id String,
  summary String,
  strengths Array(String),
  risks Array(String),
  market String,
  technology String,
  github_stars UInt32 DEFAULT 0,
  recent_commits UInt32 DEFAULT 0,
  hn_points UInt32 DEFAULT 0,
  ph_ranking Nullable(UInt32),
  funding_news String DEFAULT '',
  hiring_page String DEFAULT '',
  analyzed_at DateTime64(3)
) ENGINE = MergeTree()
ORDER BY (analyzed_at, company_id);
`;
