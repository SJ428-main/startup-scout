import { NextResponse } from "next/server";
import { getCompanies, getScoreByCompanyId } from "@/lib/clickhouse/repository";
import { ensureDemoInitialized } from "@/lib/demo/init";

export async function GET() {
  try {
    await ensureDemoInitialized();
    const companies = await getCompanies(100);
    const enriched = await Promise.all(
      companies.map(async (c) => {
        const score = await getScoreByCompanyId(c.id);
        return { ...c, score: score?.total_score };
      })
    );
    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
