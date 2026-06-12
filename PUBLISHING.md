# Publish on Render (Production — no demo mode)

This deploys Startup Scout with **real ClickHouse storage** and **DEMO_MODE=false**.

## Before you start

| What | Details |
|------|---------|
| GitHub account | Free |
| Render account | Free to sign up |
| **Cost** | ClickHouse on Render needs a **paid** private service (~**$7/month** minimum). The web app can stay on the free tier. |
| Claude (Anthropic) | **Not required** |

---

## Step 1 — Push code to GitHub

If you already did this, skip to Step 2.

```bash
cd startup-scout
git add .
git commit -m "Production Render deploy"
git push
```

---

## Step 2 — Deploy the Blueprint on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Blueprint**
3. Connect GitHub and select your **startup-scout** repo
4. Render reads **`render.yaml`** and shows **3 services**:
   - `startup-scout-clickhouse` — database (paid)
   - `startup-scout` — website (free)
   - `startup-scout-pipeline` — cron job (runs agents every 15 min)
5. Review plans — ClickHouse will be **Starter** (not free)
6. Click **Apply**

Wait **5–10 minutes** for all services to deploy.

---

## Step 3 — Confirm environment variables

Open the **startup-scout** web service → **Environment**.

You should see:

| Variable | Value |
|----------|-------|
| `DEMO_MODE` | `false` |
| `CLICKHOUSE_HOST` | auto-linked from ClickHouse service |
| `CLICKHOUSE_DATABASE` | `startup_scout` |

Do **not** set `DEMO_MODE=true`.

---

## Step 4 — Open your app

1. Click the web service URL (e.g. `https://startup-scout.onrender.com`)
2. Dashboard starts **empty** — that's correct (no fake seed data)
3. Click **Run Pipeline** to discover startups for the first time
4. Agents also run automatically every 15 minutes via the cron job

The database tables are created **automatically** on first web service start.

---

## Step 5 — Verify it's not in demo mode

- Dashboard has **no** pre-loaded CrewAI/Mem0 cards until you run the pipeline
- Data **persists** after you redeploy (stored in ClickHouse)
- Check web service **Logs** for: `[startup-scout] ClickHouse schema ready`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build failed | Check Logs; run `npm run build` locally |
| Empty dashboard | Click **Run Pipeline** once |
| API errors / 500 | ClickHouse may still be starting — wait 2 min, redeploy web service |
| `ClickHouse init failed` in logs | Open ClickHouse service — confirm it's **Live**; check `CLICKHOUSE_HOST` is set |
| Cron not running | Open **startup-scout-pipeline** cron service → Logs |
| Too expensive | Switch to demo: rename `render.demo.yaml` → `render.yaml` and redeploy |

---

## Switch back to free demo mode

1. Replace `render.yaml` with contents of `render.demo.yaml`
2. Push to GitHub
3. Re-apply Blueprint or delete old services and redeploy

Demo mode = no ClickHouse, no monthly database cost.
