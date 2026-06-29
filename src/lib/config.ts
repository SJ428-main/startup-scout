import { z } from "zod";

const envSchema = z.object({
  DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v !== "false"),
  DATABASE_URL: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional().default("claude-3-5-haiku-20241022"),
  COMPOSIO_API_KEY: z.string().optional(),
  SLACK_CHANNEL: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REPO: z.string().optional(),
  DISCOVERY_INTERVAL_MINUTES: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 15)),
  SCORE_THRESHOLD: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 85)),
});

export type Config = z.infer<typeof envSchema>;

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = envSchema.parse(process.env);
  }
  return cachedConfig;
}

export function isDemoMode(): boolean {
  return getConfig().DEMO_MODE ?? false;
}

/** Kept for backwards compat with any callers — no longer used for ClickHouse. */
export function getClickHouseUrl(): string {
  return process.env.CLICKHOUSE_HOST ?? "http://localhost:8123";
}
