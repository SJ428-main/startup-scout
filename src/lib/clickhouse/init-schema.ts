import { createClient } from "@clickhouse/client";
import { getClickHouseUrl } from "@/lib/config";
import { INIT_SQL } from "./schema";

export async function initClickHouseSchema(): Promise<void> {
  const client = createClient({
    url: getClickHouseUrl(),
    username: process.env.CLICKHOUSE_USER ?? "default",
    password: process.env.CLICKHOUSE_PASSWORD ?? "",
  });

  const statements = INIT_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await client.command({ query: stmt });
  }

  await client.close();
}
