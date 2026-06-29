# Startup Scout

An autonomous multi-agent system that discovers, researches, and ranks AI startups — fully automated, end-to-end.

**[Live demo on Render](https://startup-scout.onrender.com)** · **Zero setup required** — no API keys, no database

---

## What it does

Four agents run in a sequential pipeline, each handing off to the next:

| Agent | Role |
|-------|------|
| **Discovery** | Scrapes GitHub Trending, Hacker News, Product Hunt, and RSS feeds |
| **Research** | Fetches GitHub stats, HN points, hiring signals, and runs AI analysis via Claude |
| **Scoring** | Computes a 0–100 score across 6 weighted dimensions |
| **Action** | Generates a `cited.md` report and fires Slack/Gmail/Notion/GitHub notifications |

The pipeline runs on a cron schedule (every 15 min) or on-demand via the dashboard.

---

## Tech stack

- **Next.js 15** (App Router, TypeScript, React 19)
- **ClickHouse** for production data persistence (optional — in-memory demo store by default)
- **Anthropic Claude** (`claude-3-5-haiku`) for startup analysis (optional — heuristic fallback without key)
- **Composio** for Slack / Gmail / Notion / GitHub actions (optional — mock mode without key)
- **Tailwind CSS** + **Framer Motion** + **Radix UI**
- **node-cron** for background agent scheduling
- **Zod** for environment config validation
- **Docker** + **Render** deployment configs included

---

## Screenshots

> Dashboard with live pipeline controls, agent timeline, and scored startup cards

The UI has 6 pages:

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — stats, recent discoveries, agent timeline |
| `/discovered` | Full grid of all discovered startups |
| `/ranked` | Top-scored startups with score breakdown bars |
| `/agents` | Per-agent status cards + run history |
| `/logs` | Combined notification + agent run log |
| `/settings` | Data source status + config display |

---

## Quick start

```bash
git clone https://github.com/SJ428-main/startup-scout.git
cd startup-scout
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — demo data loads automatically.

Click **Run Pipeline** on the dashboard to execute all four agents live.

---

## Deploy to Render (free, ~5 min)

1. Push this repo to GitHub
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your `startup-scout` repo
4. Click **Apply** — Render reads `render.yaml` and deploys automatically

`DEMO_MODE=true` is already set in `render.yaml`. No ClickHouse or API keys needed.

> **Note:** Free tier sleeps after inactivity. First load may take 30–60 seconds to wake up.

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
npm run agents:start   # background scheduler
```

---

## Architecture

```
Discovery Agent → Research Agent → Scoring Agent → Action Agent
     ↓                  ↓               ↓               ↓
 Fetch sources     GitHub API      0-100 score     cited.md report
 HN / PH / RSS    Claude AI        6 dimensions    Composio alerts
```

**Data layer:** All agents read/write through a unified interface — ClickHouse in production, an in-memory store in demo mode. No code changes required to switch.

**Graceful degradation:**
- No `ANTHROPIC_API_KEY` → heuristic analysis fallback
- No `COMPOSIO_API_KEY` → mock notification mode
- No ClickHouse → in-memory demo store

---

## Project structure

```
src/
├── agents/          # Discovery, Research, Scoring, Action agents
├── app/             # Next.js App Router pages + API routes
│   └── api/         # /stats, /companies, /scores, /agents, /timeline, /notifications
├── components/      # Dashboard, StartupCard, AgentTimeline, UI primitives
└── lib/
    ├── ai/          # Anthropic Claude client (with demo fallback)
    ├── clickhouse/  # Client, repository, schema, init
    ├── composio/    # Slack, Gmail, Notion, GitHub actions
    ├── demo/        # In-memory store + seed data
    ├── reports/     # cited.md generator
    └── sources/     # GitHub, HN, Product Hunt, RSS fetchers
scripts/
├── run-demo.ts      # CLI pipeline runner
└── init-clickhouse.ts
guild/agents/        # Guild.ai agent definitions (optional platform deploy)
```

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEMO_MODE` | `true` | Use in-memory store; no external deps |
| `ANTHROPIC_API_KEY` | — | Live Claude analysis |
| `ANTHROPIC_MODEL` | `claude-3-5-haiku-20241022` | Claude model |
| `COMPOSIO_API_KEY` | — | Live Slack / Gmail / Notion / GitHub |
| `COMPOSIO_SLACK_ACCOUNT_ID` | — | Composio connected Slack account |
| `SLACK_CHANNEL` | `#startup-scout` | Target Slack channel |
| `GITHUB_TOKEN` | — | GitHub API + issue creation |
| `GITHUB_REPO` | — | Repo for GitHub issue notifications |
| `CLICKHOUSE_HOST` | `http://localhost:8123` | Production database |
| `CLICKHOUSE_DATABASE` | `startup_scout` | ClickHouse database name |
| `DISCOVERY_INTERVAL_MINUTES` | `15` | Agent run frequency |
| `SCORE_THRESHOLD` | `85` | Minimum score to trigger Action agent |

See [`.env.example`](.env.example) for the full reference.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run demo` | Run full agent pipeline (CLI, no server needed) |
| `npm run agents:start` | Start background cron scheduler |
| `npm run db:init` | Initialize ClickHouse schema |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |

---

## License

MIT — see [LICENSE](LICENSE).
