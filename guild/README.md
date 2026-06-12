# Guild.ai Agent Definitions

This directory contains typed agent contracts for deployment to the [Guild.ai](https://guild.ai) platform.

## Agents

| File | Agent | Input | Output |
|------|-------|-------|--------|
| `discovery.agent.ts` | Discovery | sources[], maxResults | companies[] |
| `research.agent.ts` | Research | companyId, metadata | analysis |
| `scoring.agent.ts` | Scoring | metrics, threshold | score breakdown |
| `action.agent.ts` | Action | companyId, report | notification results |

## Local Development

The runnable implementations live in `src/agents/`. The Guild definitions here mirror the same contracts using Zod schemas.

## Deploy to Guild

```bash
npm install -g @guildai/cli
guild login
guild agent test --ephemeral
guild agent save --publish
```

See [Guild SDK docs](https://docs.guild.ai/packages/agents-sdk) for the full deployment guide.
