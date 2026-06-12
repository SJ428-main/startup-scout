import { NextResponse } from "next/server";
import { getTopScores } from "@/lib/clickhouse/repository";
import { ensureDemoInitialized } from "@/lib/demo/init";

export async function GET() {
  try {
    await ensureDemoInitialized();
    const scores = await getTopScores(20);
    return NextResponse.json(scores);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
