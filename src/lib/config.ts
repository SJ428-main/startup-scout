import { z } from "zod";

const envSchema = z.object({
  DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v !== "false"),
  CLICKHOUSE_HOST: z.string().default("http://localhost:8123"),
  CLICKHOUSE_USER: z.string().default("default"),
  CLICKHOUSE_PASSWORD: z.string().default(""),
  CLICKHOUSE_DATABASE: z.string().default("startup_scout"),
  OPENAI_API_KEY: z.string().optional(),
  AWS_BEDROCK_REGION: z.string().optional(),
  AWS_BEDROCK_MODEL_ID: z.string().optional(),
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

/** Normalizes CLICKHOUSE_HOST for Render internal host:port values. */
export function getClickHouseUrl(): string {
  const host = getConfig().CLICKHOUSE_HOST;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host;
  }
  return `http://${host}`;
}
