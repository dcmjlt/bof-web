// Cloudflare Pages Function: receives the BOF estimate form POST and forwards
// to a Slack Incoming Webhook.
//
// Setup (one-time, per environment):
//   Cloudflare dashboard -> Pages project -> Settings -> Environment variables ->
//     SLACK_WEBHOOK_URL = https://hooks.slack.com/services/...
//   Set on Production. Optionally also on Preview (or use a separate channel).
//
// Behaviour:
//   - JS submit (Accept: application/json):
//       responds with { ok: true } so the form's inline success state fires
//   - No-JS submit (browser default Accept):
//       redirects to a small thank-you HTML rendered inline below
//   - Honeypot (`company-website` filled): silently accept; never reach Slack
//   - Missing required fields: 422 (JS) or error HTML (no-JS)
//   - SLACK_WEBHOOK_URL missing: log and still return success to the user
//     (the lead is lost, but operations gets the log; ship-blocker condition)

export async function onRequestPost({ request, env }) {
  const accept = request.headers.get("accept") || "";
  const wantsJson = accept.includes("application/json");

  let data;
  try {
    data = new URLSearchParams(await request.text());
  } catch {
    return respond(wantsJson, false, "Could not read submission.", 400);
  }

  // Honeypot: hidden `company-website` field. If filled, treat as bot and
  // silently accept (don't tip off the bot by 4xxing).
  if ((data.get("company-website") || "").trim()) {
    return respond(wantsJson, true);
  }

  const name = (data.get("name") || "").trim();
  const email = (data.get("email") || "").trim();
  const website = (data.get("website") || "").trim();
  const needs = (data.get("needs") || "").trim();
  const source = data.get("page-source") || "(unknown page)";

  if (!name || !email || !website) {
    return respond(wantsJson, false, "Please fill in your name, email and website.", 422);
  }

  const webhook = env.SLACK_WEBHOOK_URL;
  if (!webhook) {
    console.error("SLACK_WEBHOOK_URL not set; lead not forwarded.");
    return respond(wantsJson, true);
  }

  const fieldLines = [
    `*Name:* ${name}`,
    `*Business email:* ${email}`,
    `*Business website:* ${website}`,
    needs && `*What do you need run?* ${needs}`,
  ].filter(Boolean).join("\n");

  const slackText =
    `:inbox_tray: *New estimate lead*\n${fieldLines}\n` +
    `*Source page:* \`${source}\`\n_${new Date().toISOString()}_`;

  try {
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `New estimate lead from ${source}`,
        blocks: [{ type: "section", text: { type: "mrkdwn", text: slackText } }],
      }),
    });
    if (!r.ok) {
      console.error(`Slack webhook ${r.status}: ${await r.text()}`);
    }
  } catch (err) {
    console.error("Slack POST failed:", err);
  }

  return respond(wantsJson, true);
}

function respond(wantsJson, ok, error, status) {
  if (wantsJson) {
    const body = ok ? { ok: true } : { ok: false, error: error || null };
    return new Response(JSON.stringify(body), {
      status: status || (ok ? 200 : 400),
      headers: { "Content-Type": "application/json" },
    });
  }
  // No-JS path: render a small thank-you / error page inline.
  return new Response(ok ? successHTML() : errorHTML(error), {
    status: ok ? 200 : (status || 400),
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function successHTML() {
  return page(
    "Got it. Your estimate is on the way.",
    `<span class="pill">Estimate request received</span>
     <h1>Got it. Your estimate is on the way.</h1>
     <p>We will come back by email with an honest indicative range, usually within
        one working day. A real number, no runaround.</p>
     <a href="/" class="btn btn-ghost">Back to Back Office Factory</a>`,
  );
}

function errorHTML(error) {
  return page(
    "Something went wrong",
    `<h1>Something went wrong sending your estimate request.</h1>
     <p>${escapeHtml(error || "Please try again.")}</p>
     <a href="/#estimate" class="btn btn-primary">Try again</a>`,
  );
}

function page(title, inner) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} | Back Office Factory</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/assets/site.css">
<style>
  .ack{max-width:640px;margin:0 auto;padding:96px 24px;text-align:center}
  .ack h1{font-family:var(--ff-display);font-weight:800;letter-spacing:-.02em;
    font-size:clamp(32px,5vw,48px);line-height:1.1;margin:28px 0 16px}
  .ack p{font-size:18px;line-height:1.6;color:var(--ink);opacity:.86;
    max-width:48ch;margin:0 auto 32px}
</style>
</head>
<body>
<main class="ack">${inner}</main>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
