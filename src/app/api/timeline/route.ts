import { NextResponse } from "next/server";
import { getDemoTimeline } from "@/lib/demo/store";
import { ensureDemoInitialized } from "@/lib/demo/init";

export async function GET() {
  try {
    await ensureDemoInitialized();
    return NextResponse.json(getDemoTimeline());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
