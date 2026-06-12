import { NextResponse } from "next/server";
import { getSources } from "@/lib/clickhouse/repository";
import { ensureDemoInitialized } from "@/lib/demo/init";

export async function GET() {
  try {
    await ensureDemoInitialized();
    const sources = await getSources();
    return NextResponse.json(sources);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
