import { getConfig, isDemoMode } from "@/lib/config";

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  risks: string[];
  market: string;
  technology: string;
}

const DEMO_ANALYSIS: AnalysisResult = {
  summary:
    "A fast-growing AI startup with strong open-source traction and active community engagement.",
  strengths: [
    "Rapid GitHub star growth",
    "Active contributor community",
    "Clear product-market fit signals",
  ],
  risks: [
    "Early-stage funding uncertainty",
    "Competitive landscape intensifying",
  ],
  market: "Enterprise AI automation and developer tooling",
  technology: "LLM orchestration, vector search, TypeScript SDK",
};

function parseAnalysisJson(raw: string): AnalysisResult {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const json = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(json) as AnalysisResult;
}

export async function analyzeStartup(company: {
  name: string;
  description: string;
  github_stars?: number;
  hn_points?: number;
  funding_news?: string;
}): Promise<AnalysisResult> {
  if (isDemoMode()) {
    return {
      ...DEMO_ANALYSIS,
      summary: `${company.name}: ${DEMO_ANALYSIS.summary}`,
      market: `AI-powered ${company.description.slice(0, 80)}...`,
    };
  }

  const prompt = `Analyze this AI startup and return a JSON object with exactly these keys: summary (string), strengths (string array, 2-4 items), risks (string array, 2-3 items), market (string), technology (string). Return only valid JSON, no markdown.

Company: ${company.name}
Description: ${company.description}
GitHub Stars: ${company.github_stars ?? "unknown"}
HN Points: ${company.hn_points ?? "unknown"}
Funding: ${company.funding_news ?? "none found"}`;

  const config = getConfig();

  // Try Gemini first (free)
  if (config.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return parseAnalysisJson(text);
    } catch (err) {
      console.error("[AI] Gemini failed, trying fallback:", err);
    }
  }

  // Heuristic fallback — no API key configured
  return {
    summary: `${company.name} shows promising signals in the AI space with ${company.github_stars ?? 0} GitHub stars.`,
    strengths: ["Open source presence", "Community traction"],
    risks: ["Market competition", "Scaling challenges"],
    market: "AI/ML infrastructure",
    technology: "Machine learning, NLP",
  };
}
