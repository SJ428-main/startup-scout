import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/clickhouse/repository";
import { ensureDemoInitialized } from "@/lib/demo/init";

export async function GET() {
  try {
    await ensureDemoInitialized();
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
