# Startup Scout

An autonomous multi-agent system that discovers, researches, and ranks AI startups using public developer and product signals — fully automated, end-to-end.

**[Live demo](https://startup-scout.onrender.com)** · Zero setup required — no API keys, no database

---

## Resume Bullets

> Copy these directly into a CV or job application.

- **Built Startup Scout**, a full-stack startup intelligence dashboard that analyzes public developer and product signals to identify early-stage companies with strong technical momentum.
- **Implemented an explainable 0–100 scoring engine** with 5 weighted dimensions: GitHub growth (35%), engineering activity (25%), community engagement (15%), product traction (15%), and hiring signals (10%).
- **Designed a demo-safe fallback data layer** (25 real open-source startups) so the deployed app remains fully functional even when external APIs or background workers are unavailable.
- **Deployed a production-ready Next.js 15 app** on Render with standalone Docker output, ClickHouse integration, and autonomous agent scheduling via node-cron.
- **Architected a 4-agent autonomous pipeline** (Discovery → Research → Scoring → Action) that runs on a cron schedule and generates explainable research reports for high-signal companies.

---

## What it does

Four agents run in a sequential pipeline, each handing off to the next:

| Agent | Role |
|-------|------|
| **Discovery** | Scrapes GitHub Trending, Hacker News, Product Hunt, and RSS feeds |
| **Research** | Fetches GitHub stats, HN points, hiring signals, and runs AI analysis via Claude |
| **Scoring** | Computes a 0–100 momentum score across 5 weighted dimensions |
| **Action** | Generates a `cited.md` report and fires Slack/Gmail/Notion/GitHub notifications |

---

## Features

- **25 demo startups** pre-loaded (CrewAI, Mem0, OpenHands, Firecrawl, Pydantic AI, and more)
- **Explainable scoring** — every rank shows a 5-dimension breakdown and plain-English bullets
- **Startup detail pages** — `/startup/[slug]` with signal metrics, score breakdown, and research notes
- **Search + filter** on Discovered page — by name, category, source, score range, and sort order
- **Architecture page** — explains the pipeline, scoring formula, data sources, and tech stack
- **System Status page** — pipeline health, agent status, data source connectivity
- **Demo-safe fallbacks** — app shows real-looking data even without external APIs or a database
- **One-click pipeline trigger** from the dashboard
- **Agent Activity + Logs** pages with demo event fallbacks

---

## Scoring Formula

```
Momentum Score (0–100) =
  GitHub Growth Score        × 0.35   (star growth 30d, total stars)
  Engineering Activity Score × 0.25   (commits 30d, contributors 90d, releases 90d)
  Community Score            × 0.15   (HN mentions 30d, product mentions 30d)
  Product Traction Score     × 0.15   (product mentions, release cadence, HN engagement)
  Hiring Signal Score        × 0.10   (open engineering roles detected)
```

Each sub-score is independently calculated from raw signals and clamped to 0–100. The formula is transparent and documented in `src/lib/scoring.ts`.

---

## Tech stack

- **Next.js 15** (App Router, TypeScript, React 19, standalone Docker output)
- **ClickHouse** for production data persistence (optional — in-memory demo store by default)
- **Anthropic Claude** (`claude-3-5-haiku`) for startup analysis (optional — heuristic fallback without key)
- **Composio** for Slack / Gmail / Notion / GitHub actions (optional — mock mode without key)
- **Tailwind CSS** + **Framer Motion** + **Radix UI**
- **node-cron** for background agent scheduling (every 15 minutes)
- **Zod** for environment config validation
- **Docker** + **Render** deployment configs included

---

## Architecture

```
Discovery Agent → Research Agent → Scoring Agent → Action Agent
      ↓                 ↓                ↓               ↓
  Fetch sources    GitHub API       0-100 score    cited.md report
  HN / PH / RSS   Claude AI        5 dimensions   Composio alerts
```

**Data layer:** All agents read/write through a unified interface — ClickHouse in production, an in-memory store in demo mode. No code changes required to switch between modes.

**Graceful degradation:**
- No `ANTHROPIC_API_KEY` → heuristic analysis fallback
- No `COMPOSIO_API_KEY` → mock notification mode
- No ClickHouse → in-memory demo store with 25 pre-seeded startups

---

## Demo Data

`src/data/demoStartups.ts` contains 25 real open-source AI and developer-tool startups (CrewAI, Mem0, OpenHands, Firecrawl, Browser Use, Pydantic AI, LangGraph, Dify, and more). Each startup has:

- Full score breakdown (5 dimensions)
- Raw signal metrics (star growth, commits, contributors, releases, HN mentions)
- Explanation bullets explaining why it ranked
- Category, location, GitHub URL, website URL, and source tags

The app uses this demo dataset as the primary data source and will layer in live ClickHouse data when available.

---

## Screenshots

> Add screenshots to `/public/screenshots/` and reference them here.

```
public/
└── screenshots/
    ├── dashboard.png
    ├── discovered.png
    ├── ranked.png
    └── detail.png
```

---

## Quick start

```bash
git clone https://github.com/SJ428-main/startup-scout.git
cd startup-scout
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — 25 demo startups load automatically.

---

## Deploy to Render (free, ~5 min)

1. Push this repo to GitHub
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your `startup-scout` repo
4. Click **Apply** — Render reads `render.yaml` and deploys automatically

`DEMO_MODE=true` is already set in `render.yaml`. No ClickHouse or API keys needed.

> Free tier sleeps after inactivity — first load may take 30–60 seconds to wake up.

---

## Deploy with Docker

```bash
docker compose up --build
```

For production with ClickHouse:

```bash
docker compose up clickhouse -d
DEMO_MODE=false npm run db:init
npm run dev
npm run agents:start
```

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEMO_MODE` | `true` | Use in-memory demo store; no external deps required |
| `ANTHROPIC_API_KEY` | — | Live Claude analysis (optional) |
| `ANTHROPIC_MODEL` | `claude-3-5-haiku-20241022` | Claude model to use |
| `COMPOSIO_API_KEY` | — | Live Slack / Gmail / Notion / GitHub (optional) |
| `COMPOSIO_SLACK_ACCOUNT_ID` | — | Composio connected Slack account |
| `SLACK_CHANNEL` | `#startup-scout` | Target Slack channel |
| `GITHUB_TOKEN` | — | GitHub API access (higher rate limits) |
| `GITHUB_REPO` | — | Repo for GitHub issue notifications |
| `CLICKHOUSE_HOST` | `http://localhost:8123` | Production database host |
| `CLICKHOUSE_DATABASE` | `startup_scout` | ClickHouse database name |
| `DISCOVERY_INTERVAL_MINUTES` | `15` | Agent pipeline run frequency |
| `SCORE_THRESHOLD` | `85` | Minimum score to trigger Action agent |

---

## Project structure

```
src/
├── agents/          # Discovery, Research, Scoring, Action agents
├── app/             # Next.js App Router pages + API routes
│   ├── api/enriched/  # Enriched startup data endpoints
│   ├── startup/[slug] # Startup detail page
│   ├── architecture/  # How it works page
│   └── status/        # System status page
├── components/      # Dashboard, StartupCard, AgentTimeline, UI primitives
├── data/
│   └── demoStartups.ts  # 25 demo startups with full signal data
└── lib/
    ├── ai/          # Anthropic Claude client
    ├── clickhouse/  # Client, repository, schema, init
    ├── composio/    # Slack, Gmail, Notion, GitHub actions
    ├── demo/        # In-memory store + seed data
    ├── reports/     # cited.md generator
    ├── scoring.ts   # Explainable scoring engine
    └── sources/     # GitHub, HN, Product Hunt, RSS fetchers
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run demo` | Run agent pipeline via CLI |
| `npm run agents:start` | Start background cron scheduler |
| `npm run db:init` | Initialize ClickHouse schema |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |

---

## Future improvements

- [ ] Live GitHub API integration (requires `GITHUB_TOKEN`)
- [ ] Product Hunt API integration
- [ ] Persistent user bookmarks
- [ ] Email digest for weekly top-ranked startups
- [ ] Competitor tracking (compare two startups)
- [ ] Historical score tracking over time

---

## Disclaimer

Startup Scout is a research and discovery tool. Scores are based on public technical and product signals and are not financial advice. Always conduct your own due diligence.

---

## License

MIT — see [LICENSE](LICENSE).
