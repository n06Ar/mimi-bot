/**
 * Discord Webhook ハンドラー
 * GitHub からの webhook イベントを受け取って Discord に転送する
 */

const PORT = 3000;

interface WebhookPayload {
  action: string;
  pull_request?: {
    number: number;
    title: string;
    html_url: string;
    user: { login: string };
  };
  repository: {
    full_name: string;
  };
}

async function sendToDiscord(webhookUrl: string, message: string) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
  return res;
}

function buildMessage(payload: WebhookPayload): string {
  const pr = payload.pull_request;
  const repo = payload.repository.full_name;

  if (payload.action == "opened") {
    return `🆕 PR がオープンされたよ\n\`${repo}\` PR #${pr!.number}: **${pr!.title}**\n👤 ${pr!.user.login}\n🔗 ${pr!.html_url}`;
  }

  if (payload.action == "closed") {
    return `🚫 PR がクローズされたよ\n\`${repo}\` PR #${pr!.number}: **${pr!.title}**`;
  }

  return `🔔 GitHub 通知: ${payload.action}`;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    let body: WebhookPayload;
    try {
      body = await req.json();
    } catch (e) {
      return new Response("Bad Request", { status: 400 });
    }

    const message = buildMessage(body);
    const res = await sendToDiscord(webhookUrl, message);

    if (!res.ok) {
      console.error("Discord への送信に失敗:", res.status);
    }

    return new Response("ok");
  },
});

console.log(`Webhook server running on port ${server.port}`);
