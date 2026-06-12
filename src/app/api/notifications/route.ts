import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/clickhouse/repository";
import { ensureDemoInitialized } from "@/lib/demo/init";

export async function GET() {
  try {
    await ensureDemoInitialized();
    const notifications = await getNotifications(50);
    return NextResponse.json(notifications);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
