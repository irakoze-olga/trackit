import { env } from "../config/env.js";

export async function sendSlackDM(slackUserId: string | undefined | null, text: string) {
  if (!env.SLACK_BOT_TOKEN || !slackUserId || !text) {
    return false;
  }

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel: slackUserId,
      text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!payload.ok) {
    console.error("Slack DM failed", payload.error || response.statusText);
    return false;
  }

  return true;
}

