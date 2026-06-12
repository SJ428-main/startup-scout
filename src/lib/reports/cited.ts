import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { Company, ResearchAnalysis, StartupScore } from "@/types";

export function generateCitedMd(ctx: {
  company: Company;
  research: ResearchAnalysis;
  score: StartupScore;
}): string {
  const { company, research, score } = ctx;

  const reasons: string[] = [];
  if (score.github_activity > 70)
    reasons.push(`Rapid GitHub growth (${research.github_stars.toLocaleString()} stars)`);
  if (score.community_interest > 60)
    reasons.push(`High Hacker News engagement (${research.hn_points} points)`);
  if (score.recent_launches > 70)
    reasons.push(
      research.ph_ranking
        ? `Product Hunt launch — ranked #${research.ph_ranking}`
        : "Recent product launch detected"
    );
  if (score.hiring_signal > 60) reasons.push("Active hiring signals detected");
  if (score.momentum > 75) reasons.push("Strong momentum across all signals");

  if (reasons.length === 0) {
    reasons.push("Promising AI startup with notable community traction");
  }

  const sources = [
    ...company.source_urls,
    company.website,
    company.github_url,
    research.hiring_page,
  ].filter(Boolean);

  return `# Startup Scout Report

## Company

**${company.name}**

Score: **${score.total_score}**

### Description

${company.description}

### Reason

${reasons.map((r) => `- ${r}`).join("\n")}

### Analysis

${research.summary}

**Strengths:**
${research.strengths.map((s) => `- ${s}`).join("\n")}

**Risks:**
${research.risks.map((r) => `- ${r}`).join("\n")}

**Market:** ${research.market}

**Technology:** ${research.technology}

### Score Breakdown

| Dimension | Score |
|-----------|-------|
| GitHub Activity | ${score.github_activity} |
| Community Interest | ${score.community_interest} |
| Recent Launches | ${score.recent_launches} |
| Hiring Signal | ${score.hiring_signal} |
| Technical Innovation | ${score.technical_innovation} |
| Momentum | ${score.momentum} |

## Sources

${sources.map((s) => `- ${s}`).join("\n")}

---

*Generated automatically by Startup Scout AI*
*${new Date().toISOString()}*
`;
}

export async function saveCitedMd(
  companyName: string,
  content: string
): Promise<string> {
  const dir = path.join(process.cwd(), "reports");
  await mkdir(dir, { recursive: true });
  const filename = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-cited.md`;
  const filepath = path.join(dir, filename);
  await writeFile(filepath, content, "utf-8");
  return filepath;
}
