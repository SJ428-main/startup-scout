import type { Company, NotificationChannel, ResearchAnalysis, StartupScore } from "@/types";
import { getConfig, isDemoMode } from "@/lib/config";

export interface ComposioActionResult {
  channel: NotificationChannel;
  status: "sent" | "failed" | "mock";
  payload: Record<string, unknown>;
}

interface ActionContext {
  company: Company;
  research: ResearchAnalysis;
  score: StartupScore;
  reportContent: string;
}

async function sendSlack(ctx: ActionContext): Promise<ComposioActionResult> {
  const message = `🚀 *High-Score Startup Alert*\n*${ctx.company.name}* scored *${ctx.score.total_score}/100*\n${ctx.research.summary}`;

  if (isDemoMode() || !getConfig().COMPOSIO_API_KEY) {
    return {
      channel: "slack",
      status: "mock",
      payload: { message, channel: getConfig().SLACK_CHANNEL ?? "#startup-scout" },
    };
  }

  try {
    // Composio Slack integration
    const res = await fetch("https://backend.composio.dev/api/v2/actions/SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getConfig().COMPOSIO_API_KEY!,
      },
      body: JSON.stringify({
        connectedAccountId: process.env.COMPOSIO_SLACK_ACCOUNT_ID,
        input: {
          channel: getConfig().SLACK_CHANNEL ?? "#startup-scout",
          text: message,
        },
      }),
    });

    return {
      channel: "slack",
      status: res.ok ? "sent" : "failed",
      payload: { message },
    };
  } catch {
    return { channel: "slack", status: "mock", payload: { message } };
  }
}

async function sendGmail(ctx: ActionContext): Promise<ComposioActionResult> {
  const subject = `Startup Scout: ${ctx.company.name} — Score ${ctx.score.total_score}`;
  const body = ctx.reportContent;

  if (isDemoMode() || !getConfig().COMPOSIO_API_KEY) {
    return {
      channel: "gmail",
      status: "mock",
      payload: { subject, bodyPreview: body.slice(0, 200) },
    };
  }

  return {
    channel: "gmail",
    status: "mock",
    payload: { subject, note: "Configure COMPOSIO_GMAIL_ACCOUNT_ID for live sends" },
  };
}

async function createNotionPage(ctx: ActionContext): Promise<ComposioActionResult> {
  const title = `Startup Scout: ${ctx.company.name}`;

  if (isDemoMode() || !getConfig().COMPOSIO_API_KEY) {
    return {
      channel: "notion",
      status: "mock",
      payload: { title, content: ctx.reportContent.slice(0, 500) },
    };
  }

  return {
    channel: "notion",
    status: "mock",
    payload: { title, note: "Configure COMPOSIO_NOTION_ACCOUNT_ID for live creates" },
  };
}

async function createGitHubIssue(ctx: ActionContext): Promise<ComposioActionResult> {
  const title = `[Scout] Review ${ctx.company.name} — Score ${ctx.score.total_score}`;
  const body = ctx.reportContent;

  if (isDemoMode() || !getConfig().GITHUB_TOKEN) {
    return {
      channel: "github",
      status: "mock",
      payload: { title, repo: getConfig().GITHUB_REPO ?? "startup-scout/reviews" },
    };
  }

  try {
    const repo = getConfig().GITHUB_REPO ?? "owner/repo";
    const [owner, repoName] = repo.split("/");
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getConfig().GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      }
    );

    const data = res.ok ? await res.json() : null;
    return {
      channel: "github",
      status: res.ok ? "sent" : "failed",
      payload: { title, url: data?.html_url },
    };
  } catch {
    return { channel: "github", status: "mock", payload: { title } };
  }
}

export async function executeComposioActions(
  ctx: ActionContext
): Promise<ComposioActionResult[]> {
  return Promise.all([
    sendSlack(ctx),
    sendGmail(ctx),
    createNotionPage(ctx),
    createGitHubIssue(ctx),
  ]);
}
