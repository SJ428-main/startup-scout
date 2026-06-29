import { neon } from "@neondatabase/serverless";
import { INIT_SQL } from "./schema";

export async function initClickHouseSchema(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[db] DATABASE_URL not set — skipping schema init");
    return;
  }

  const sql = neon(url);

  // Split on statement boundaries, filtering blanks
  const statements = INIT_SQL.split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await sql(stmt);
  }

  console.log("[db] PostgreSQL schema ready");
}
