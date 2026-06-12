# Publishing on Render

Step-by-step guide to publish **Startup Scout** on [Render](https://render.com).

## What you need

- A [GitHub](https://github.com) account
- A [Render](https://render.com) account (free tier works for demo)

## Step 1 — Push to GitHub

```bash
cd startup-scout
git init
git add .
git commit -m "Initial release: Startup Scout"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/startup-scout.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 2 — Deploy with Render Blueprint

1. Log in to [dashboard.render.com](https://dashboard.render.com/)
2. Click **New** → **Blueprint**
3. Connect your GitHub account if prompted
4. Select the `startup-scout` repository
5. Render detects `render.yaml` and shows:
   - **startup-scout** — Web Service (Node)
6. Click **Apply**

Render will:

- Run `npm ci && npm run build`
- Start with `npm start`
- Set `DEMO_MODE=true` (no database required)

First deploy takes about **3–5 minutes**.

## Step 3 — Open your live app

After deploy succeeds, Render shows a URL like:

```
https://startup-scout-xxxx.onrender.com
```

Open it in your browser. You should see the dashboard with seeded demo data.

Click **Run Pipeline** to execute the full agent workflow.

## Step 4 — Custom domain (optional)

1. In Render, open your **startup-scout** web service
2. Go to **Settings** → **Custom Domains**
3. Add your domain and follow DNS instructions

## Environment variables (optional)

Set these in **Environment** on your Render web service:

| Variable | When to add |
|----------|-------------|
| `OPENAI_API_KEY` | Live AI analysis instead of heuristics |
| `COMPOSIO_API_KEY` | Live Slack/Gmail/Notion/GitHub actions |
| `GITHUB_TOKEN` | Higher GitHub API rate limits |

Leave `DEMO_MODE=true` unless you deploy the production stack below.

## Production stack (advanced)

For persistent ClickHouse storage and background agents every 15 minutes:

1. Use `render.production.yaml` (rename to `render.yaml` or create services manually)
2. Deploys three services:
   - **startup-scout** — Web dashboard
   - **startup-scout-agents** — Background worker (`npm run agents:start`)
   - **startup-scout-clickhouse** — Database
3. Set `DEMO_MODE=false` on web + worker
4. Run once in the web service shell:

   ```bash
   npm run db:init
   ```

Note: ClickHouse on Render requires a paid private service plan for persistent disk.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check Render logs; run `npm run build` locally first |
| App sleeps on free tier | First request after idle may take ~30s (cold start) |
| Empty dashboard | Confirm `DEMO_MODE=true` is set in Environment |
| 502 on health check | Wait for build to finish; path is `/api/stats` |

## Pre-flight checklist

```bash
npm install
npm run build    # must pass
npm run demo     # optional — test pipeline locally
```

## What works in demo mode on Render

| Feature | Status |
|---------|--------|
| Dashboard + all pages | ✅ |
| Run Pipeline button | ✅ |
| Agent timeline | ✅ |
| Startup scoring | ✅ |
| cited.md generation | ✅ (ephemeral — resets on redeploy) |
| Slack/Gmail/Notion/GitHub | Mock mode |
| ClickHouse | In-memory (resets on redeploy) |
