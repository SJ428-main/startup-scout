import { NextResponse } from "next/server";
import { getAgentRuns } from "@/lib/clickhouse/repository";
import { runFullPipeline } from "@/agents/orchestrator";
import { ensureDemoInitialized } from "@/lib/demo/init";

export async function GET() {
  try {
    await ensureDemoInitialized();
    const runs = await getAgentRuns(50);
    return NextResponse.json(runs);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await ensureDemoInitialized();
    const result = await runFullPipeline();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
