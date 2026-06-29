import { initClickHouseSchema } from "../src/lib/clickhouse/init-schema";

async function main() {
  await initClickHouseSchema();
  console.log("Database schema initialized successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
