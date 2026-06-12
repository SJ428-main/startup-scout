# Publishing on Render (Demo mode)

Free deploy. No ClickHouse, no API keys, no credit card for AI.

## Step 1 — Push to GitHub

```bash
cd startup-scout
git add .
git commit -m "Demo mode deploy"
git push
```

## Step 2 — Deploy on Render

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**
2. Connect your **startup-scout** repo
3. Render shows **one** service: `startup-scout` (web)
4. Click **Apply**
5. Wait ~5 minutes

## Step 3 — Open your app

Click the URL Render gives you (e.g. `https://startup-scout.onrender.com`).

You should see the dashboard with **CrewAI, Mem0**, etc. already loaded.

Click **Run Pipeline** to run the agents.

## Environment (already set)

| Variable | Value |
|----------|-------|
| `DEMO_MODE` | `true` |

Nothing else required.

## If you deployed production before

Delete the old Render services first:

- `startup-scout-clickhouse`
- `startup-scout-pipeline` (cron)
- Old `startup-scout` web service

Then deploy the Blueprint again with the new `render.yaml`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Slow first load | Free tier sleeps — wait 30–60 sec |
| Empty dashboard | Confirm `DEMO_MODE=true` in Environment |
| Build failed | Check Logs; run `npm run build` locally |

## Production mode later?

See `render.production.yaml` — requires paid ClickHouse (~$7/mo). Not needed for demo.
