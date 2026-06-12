/**
 * Guild.ai Discovery Agent Definition
 *
 * Deploy with: guild agent save --publish
 * Test with: guild agent test --ephemeral
 *
 * Note: This agent runs in Guild's sandboxed TypeScript runtime.
 * For local orchestration, see src/agents/discovery.ts
 */
import { z } from "zod";

// Guild SDK types — use when deploying to Guild platform
// import { agent } from "@guildai/agents-sdk";

export const discoveryInputSchema = z.object({
  sources: z
    .array(
      z.enum([
        "github_trending",
        "hacker_news",
        "product_hunt",
        "rss",
        "ai_blog",
      ])
    )
    .default(["github_trending", "hacker_news", "product_hunt", "rss"]),
  maxResults: z.number().default(20),
});

export const discoveryOutputSchema = z.object({
  discovered: z.number(),
  companies: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      website: z.string(),
      github_url: z.string(),
      source_type: z.string(),
      source_urls: z.array(z.string()),
    })
  ),
});

export type DiscoveryInput = z.infer<typeof discoveryInputSchema>;
export type DiscoveryOutput = z.infer<typeof discoveryOutputSchema>;

/**
 * Guild agent export — uncomment when deploying to Guild platform:
 *
 * export default agent({
 *   description: "Discovers promising AI startups from web sources",
 *   inputSchema: discoveryInputSchema,
 *   outputSchema: discoveryOutputSchema,
 *   async run(input, task) {
 *     task.console.info("Discovery agent starting...");
 *     // Guild runtime handles tool calls to GitHub, HN, etc.
 *     return { discovered: 0, companies: [] };
 *   },
 * });
 */
