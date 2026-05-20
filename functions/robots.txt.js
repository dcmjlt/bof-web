// Cloudflare Pages Function: serves /robots.txt directly so the zone-level
// "Manage robots.txt" / "AI Crawl Control" injection (the `Content-Signal:`
// directive + AI-bot Disallow stanzas prepended above our content) doesn't
// land on the response.
//
// Why: Lighthouse's robots.txt validator doesn't recognize Cloudflare's
// `Content-Signal:` directive yet and flags it as "Unknown directive",
// dropping every page's SEO score by 8 points. The AI-bot User-agent +
// Disallow blocks were valid, but the Content-Signal line was not.
//
// Trade-off accepted: removing CF's injected stanza means AI training bots
// (GPTBot, ClaudeBot, Bytespider, CCBot, Google-Extended, Applebot-Extended,
// meta-externalagent, Amazonbot, etc.) lose the robots.txt-level disallow.
// We re-add them here in plain `User-agent: X / Disallow: /` form — same
// behavioural protection, no Content-Signal line. If Cloudflare's bot-management
// rules still block these at the edge (separate from robots.txt), this is
// belt-and-braces.
//
// Function routes win over the static /robots.txt in the repo, so this file
// is what visitors hit. If we ever want to revert to CF-managed robots.txt
// (e.g. Lighthouse adds Content-Signal support), delete this file and the
// zone-level injection takes over again.

const BODY = `# Back Office Factory — backofficefactory.com
# Mixed page-level robots state (2026-05-20):
#   noindex,follow   index.html, about/index.html, privacy.html   (body-copy
#                    placeholders: testimonial, case studies, founder photo,
#                    legal entity / retention period / contact route)
#   index,follow     all other 23 pages (only footer trust-flag placeholders;
#                    risk knowingly accepted to start crawl coverage early)
# See TODOS.md §1 for the flip-back conditions.
# Indexing is controlled by the per-page meta robots tag, not by this file.

# AI training / scraping bots — disallowed at the robots.txt layer.
# (Originally injected by Cloudflare's AI Crawl Control; re-stated here so
# the protection survives bypassing the CF injection for Content-Signal.)
User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CloudflareBrowserRenderingCrawler
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

User-agent: *
Allow: /
Disallow: /functions/
Disallow: /scripts/
Disallow: /print/

Sitemap: https://backofficefactory.com/sitemap.xml
`;

export function onRequestGet() {
  return new Response(BODY, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
