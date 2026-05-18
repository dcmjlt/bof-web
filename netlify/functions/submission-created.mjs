// Auto-invoked by Netlify on every VERIFIED (non-spam) form submission.
// Forwards the lead to a free Slack Incoming Webhook. No Netlify paid feature.
//
// Setup (see project notes):
//   1. Create a free Slack Incoming Webhook, copy its URL.
//   2. Netlify -> Site config -> Environment variables -> add
//      SLACK_WEBHOOK_URL = https://hooks.slack.com/services/...
//   3. Redeploy. Submissions now ping Slack automatically.
//
// Only verified submissions reach this event, so spam never pings Slack.

export default async (req) => {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) {
    console.error("SLACK_WEBHOOK_URL not set — cannot forward submission to Slack.");
    return new Response("missing SLACK_WEBHOOK_URL", { status: 200 }); // 200: don't retry-storm
  }

  let payload;
  try {
    ({ payload } = await req.json());
  } catch {
    console.error("Could not parse submission-created body.");
    return new Response("bad payload", { status: 200 });
  }

  const data = payload?.data || {};
  const formName = payload?.form_name || "estimate";
  const source = data["page-source"] || "(unknown page)";
  const when = payload?.created_at || new Date().toISOString();

  // Render every submitted field in submission order, skipping internal/honeypot.
  const skip = new Set(["form-name", "company-website", "ip", "user_agent", "referrer"]);
  const fieldLines = (payload?.ordered_human_fields || [])
    .filter((f) => !skip.has(f.name) && f.value)
    .map((f) => `*${f.title}:* ${f.value}`)
    .join("\n");

  const text =
    `:inbox_tray: *New ${formName} lead*\n` +
    `${fieldLines || "(no fields)"}\n` +
    `*Source page:* \`${source}\`\n` +
    `_${when}_`;

  const msg = {
    text: `New ${formName} lead from ${source}`, // notification/fallback text
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text },
      },
    ],
  };

  try {
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
    if (!r.ok) {
      console.error(`Slack webhook returned ${r.status}: ${await r.text()}`);
    }
  } catch (err) {
    console.error("Failed to POST to Slack webhook:", err);
  }

  // Always 200 — the submission is already safely stored in Netlify Forms;
  // a Slack failure should not look like a submission failure.
  return new Response("ok", { status: 200 });
};
