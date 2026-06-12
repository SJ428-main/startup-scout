import { z } from "zod";

export const scoringInputSchema = z.object({
  companyId: z.string(),
  github_stars: z.number(),
  recent_commits: z.number(),
  hn_points: z.number(),
  ph_ranking: z.number().nullable(),
  strengths: z.array(z.string()),
  threshold: z.number().default(85),
});

export const scoringOutputSchema = z.object({
  total_score: z.number(),
  github_activity: z.number(),
  community_interest: z.number(),
  recent_launches: z.number(),
  hiring_signal: z.number(),
  technical_innovation: z.number(),
  momentum: z.number(),
  triggered_action: z.boolean(),
});
