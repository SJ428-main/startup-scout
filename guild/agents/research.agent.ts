import { z } from "zod";

export const researchInputSchema = z.object({
  companyId: z.string(),
  name: z.string(),
  description: z.string(),
  github_url: z.string().optional(),
  website: z.string().optional(),
});

export const researchOutputSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  risks: z.array(z.string()),
  market: z.string(),
  technology: z.string(),
  github_stars: z.number(),
  recent_commits: z.number(),
  hn_points: z.number(),
});

export type ResearchInput = z.infer<typeof researchInputSchema>;
export type ResearchOutput = z.infer<typeof researchOutputSchema>;
