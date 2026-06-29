import { NextResponse } from "next/server";
import { DEMO_STARTUPS } from "@/data/demoStartups";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const startup = DEMO_STARTUPS.find((s) => s.slug === slug);
  if (!startup) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(startup);
}
