import { neon } from "@neondatabase/serverless";
import { isDemoMode } from "@/lib/config";

type NeonSQL = ReturnType<typeof neon>;
let _sql: NeonSQL | null = null;

function getDB(): NeonSQL {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}

/**
 * Converts ClickHouse-style named params {name:Type} to PostgreSQL $N positional params.
 * Also normalises a handful of ClickHouse-only SQL constructs.
 */
function toPg(sql: string, params: Record<string, unknown> = {}): [string, unknown[]] {
  const values: unknown[] = [];
  let pg = sql
    // Named params: {name:SomeType} → $N
    .replace(/\{(\w+):[^}]+\}/g, (_, name) => {
      values.push(params[name] ?? null);
      return `$${values.length}`;
    })
    // ClickHouse aggregate names
    .replace(/\bcount\(\)/gi, "COUNT(*)::int")
    .replace(/\bmax\(/gi, "MAX(")
    .replace(/\bmin\(/gi, "MIN(")
    // ClickHouse now64() → PostgreSQL NOW()
    .replace(/\bnow64\(\d*\)/gi, "NOW()")
    // ClickHouse ALTER TABLE … UPDATE → PostgreSQL UPDATE … SET
    .replace(
      /ALTER\s+TABLE\s+(\w+)\s+UPDATE\s+(.+?)\s+WHERE\s+(.+)/i,
      "UPDATE $1 SET $2 WHERE $3"
    );

  return [pg, values];
}

export async function query<T>(
  sql: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  if (isDemoMode()) {
    const { getDemoStore } = await import("@/lib/demo/store");
    return getDemoStore().query<T>(sql, params);
  }

  const db = getDB();
  const [pgSQL, values] = toPg(sql, params);
  const rows = await db(pgSQL, values);
  return rows as unknown as T[];
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

  const db = getDB();
  // Strip optional ClickHouse schema prefix e.g. "startup_scout.companies"
  const tableName = table.replace(/^startup_scout\./, "");

  for (const row of rows) {
    const cols = Object.keys(row);
    const vals = cols.map((c) => row[c]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    await db(
      `INSERT INTO ${tableName} (${colList}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
      vals
    );
  }
}

export async function command(sql: string): Promise<void> {
  if (isDemoMode()) return;
  const db = getDB();
  await db(sql);
}
