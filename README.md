# Startup Scout

Autonomous multi-agent system that discovers promising AI startups, analyzes them with real data, ranks them 0–100, and triggers automated actions.

**Works out of the box** — no API keys or database required for the live demo.

## Live demo features

- 4 autonomous agents: Discovery → Research → Scoring → Action
- Dark dashboard with startup cards, scores, and agent timeline
- One-click **Run Pipeline** to execute the full workflow
- Auto-generated `cited.md` reports for high-scoring startups
- Composio integrations (Slack, Gmail, Notion, GitHub) with mock mode

## Quick start (local)

```bash
git clone https://github.com/your-username/startup-scout.git
cd startup-scout
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Render

### Option A — Blueprint (easiest)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo (`startup-scout`)
5. Render reads `render.yaml` and creates the web service
6. Click **Apply** — deploy takes ~3–5 minutes
7. Open your app at `https://startup-scout.onrender.com` (or the URL Render assigns)

`DEMO_MODE=true` is set in `render.yaml`, so no ClickHouse or API keys are needed.

### Option B — Manual web service

1. **New** → **Web Service** → connect your repo
2. Settings:
   - **Runtime:** Node
   - **Build command:** `npm ci && npm run build`
   - **Start command:** `npm start`
   - **Health check path:** `/api/stats`
3. Environment variables:

   | Key | Value |
   |-----|-------|
   | `DEMO_MODE` | `true` |
   | `NODE_ENV` | `production` |

4. Deploy

### Production stack (ClickHouse + background agents)

For persistent data and scheduled agents, use `render.production.yaml`:

1. **New** → **Blueprint**
2. Point Render at `render.production.yaml` (rename to `render.yaml` or import manually)
3. After deploy, run schema init once via Render shell: `npm run db:init`

See [PUBLISHING.md](PUBLISHING.md) for the full step-by-step guide.

## Local Docker

```bash
docker compose up --build
```

## Production mode (local)

```bash
docker compose up clickhouse -d
DEMO_MODE=false npm run db:init
npm run dev          # dashboard
npm run agents:start # background scheduler
```

## Project structure

```
src/
├── agents/          # Discovery, Research, Scoring, Action
├── app/             # Next.js 15 pages + API routes
├── components/      # Dashboard UI
└── lib/             # ClickHouse, AI, Composio, demo store
guild/agents/        # Guild.ai deploy definitions
reports/             # Generated cited.md files
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEMO_MODE` | `true` | In-memory store, no external deps |
| `OPENAI_API_KEY` | — | Live AI analysis |
| `COMPOSIO_API_KEY` | — | Live Slack/Gmail/Notion/GitHub |
| `CLICKHOUSE_HOST` | `http://localhost:8123` | Production database |
| `SCORE_THRESHOLD` | `85` | Action agent trigger threshold |

See [`.env.example`](.env.example) for the full list.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run demo` | Run full agent pipeline (CLI) |
| `npm run agents:start` | Start scheduled agent worker |
| `npm run db:init` | Initialize ClickHouse schema |

## License

MIT — see [LICENSE](LICENSE).
