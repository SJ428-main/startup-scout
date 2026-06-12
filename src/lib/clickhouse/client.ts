import { createClient, type ClickHouseClient } from "@clickhouse/client";
import { getConfig, getClickHouseUrl, isDemoMode } from "@/lib/config";

let client: ClickHouseClient | null = null;

export function getClickHouseClient(): ClickHouseClient {
  if (!client) {
    const config = getConfig();
    client = createClient({
      url: getClickHouseUrl(),
      username: config.CLICKHOUSE_USER,
      password: config.CLICKHOUSE_PASSWORD,
      database: config.CLICKHOUSE_DATABASE,
    });
  }
  return client;
}

export async function query<T>(
  sql: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  if (isDemoMode()) {
    const { getDemoStore } = await import("@/lib/demo/store");
    return getDemoStore().query<T>(sql, params);
  }

  const ch = getClickHouseClient();
  const result = await ch.query({
    query: sql,
    query_params: params,
    format: "JSONEachRow",
  });
  return result.json<T>();
}

export async function insert(
  table: string,
  rows: Record<string, unknown>[]
): Promise<void> {
  if (rows.length === 0) return;

  if (isDemoMode()) {
    const { getDemoStore } = await import("@/lib/demo/store");
    getDemoStore().insert(table, rows);
    return;
  }

  const ch = getClickHouseClient();
  await ch.insert({
    table,
    values: rows,
    format: "JSONEachRow",
  });
}

export async function command(sql: string): Promise<void> {
  if (isDemoMode()) return;

  const ch = getClickHouseClient();
  await ch.command({ query: sql });
}
