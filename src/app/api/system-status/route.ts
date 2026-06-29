import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/config";

export async function GET() {
  const live = !isDemoMode();
  return NextResponse.json({
    live,
    database: live && !!process.env.DATABASE_URL,
    aiAnalysis: live && !!process.env.GEMINI_API_KEY,
    githubAuth: live && !!process.env.GITHUB_TOKEN,
  });
}
