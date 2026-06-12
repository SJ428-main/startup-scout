import OpenAI from "openai";
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

  const config = getConfig();
  const prompt = `Analyze this AI startup and return JSON with keys: summary, strengths (array), risks (array), market, technology.

Company: ${company.name}
Description: ${company.description}
GitHub Stars: ${company.github_stars ?? "unknown"}
HN Points: ${company.hn_points ?? "unknown"}
Funding: ${company.funding_news ?? "none found"}`;

  if (config.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a startup analyst. Return valid JSON only, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    const content = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(content) as AnalysisResult;
  }

  // Fallback heuristic analysis without API key
  return {
    summary: `${company.name} shows promising signals in the AI space with ${company.github_stars ?? 0} GitHub stars.`,
    strengths: ["Open source presence", "Community traction"],
    risks: ["Market competition", "Scaling challenges"],
    market: "AI/ML infrastructure",
    technology: "Machine learning, NLP",
  };
}
