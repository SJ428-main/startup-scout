import { z } from "zod";

export const actionInputSchema = z.object({
  companyId: z.string(),
  companyName: z.string(),
  score: z.number(),
  reportContent: z.string(),
  channels: z
    .array(z.enum(["slack", "gmail", "notion", "github"]))
    .default(["slack", "gmail", "notion", "github"]),
});

export const actionOutputSchema = z.object({
  notifications_sent: z.number(),
  report_path: z.string(),
  channels: z.array(
    z.object({
      channel: z.string(),
      status: z.string(),
    })
  ),
});
