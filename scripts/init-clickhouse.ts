import { createClient } from "@clickhouse/client";
import { INIT_SQL } from "../src/lib/clickhouse/schema";

async function main() {
  const client = createClient({
    url: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
    username: process.env.CLICKHOUSE_USER ?? "default",
    password: process.env.CLICKHOUSE_PASSWORD ?? "",
  });

  const statements = INIT_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    console.log(`Executing: ${stmt.slice(0, 60)}...`);
    await client.command({ query: stmt });
  }

  console.log("ClickHouse schema initialized successfully.");
  await client.close();
}

main().catch(console.error);
