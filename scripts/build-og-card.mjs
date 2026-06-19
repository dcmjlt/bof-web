#!/usr/bin/env node
/* Back Office Factory — Open Graph / social-share card generator.
 *
 * Produces /assets/og/social-card.png (1200×630), the image LinkedIn, Facebook,
 * Slack, iMessage etc. show when someone shares a backofficefactory.com link.
 * Without an og:image those scrapers fall back to whatever raster they can find
 * on the page — which is why a client proof logo (VoucherCodes.ae) was showing
 * in LinkedIn previews. This card is the designated share image instead.
 *
 * The card is composed entirely from brand assets already in the repo:
 *   - assets/primary-icon.svg      (the BOF mark)
 *   - assets/primary-wordmark.svg  (the "BackofficeFactory" wordmark)
 *   - assets/fonts/cabinet-grotesk-{800,500}.woff2  (display typeface)
 * Palette + tokens are the locked v2 design system (DESIGN.md / index.html).
 *
 * Deps are NOT vendored (this repo is otherwise zero-dep). To regenerate:
 *   npm install @resvg/resvg-js wawoff2
 *   node scripts/build-og-card.mjs
 * resvg can't read woff2 directly, so we decompress the repo's own woff2 to
 * sfnt in memory with wawoff2 — no extra font files committed.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import wawoff2 from "wawoff2";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const A = (p) => join(ROOT, "assets", p);

// Locked v2 palette (subset used here).
const C = {
  surface: "#FAF7F2", // warm off-white card
  ink: "#1F1A14", // headline
  ground: "#1E3D32", // deep green
  accentInk: "#9A4A1E", // terracotta-as-text (AA on cream)
  muted: "#6F665A", // warm grey (AA on cream)
  rule: "#DDD6C8", // hairline
};

const W = 1200;
const H = 630;
const PAD = 84;

// --- Inline the BOF mark ----------------------------------------------------
// primary-icon.svg styles its two paths via CSS classes in <defs>; resvg's CSS
// support is partial, so swap the classes for explicit fills and drop the defs.
const iconRaw = readFileSync(A("primary-icon.svg"), "utf8");
const iconInner = iconRaw
  .replace(/<defs>[\s\S]*?<\/defs>/, "")
  .replace(/class="cls-1"/g, `fill="${C.ink}"`)
  .replace(/class="cls-2"/g, 'fill="#fbf7f0"')
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");

// --- Inline the wordmark ----------------------------------------------------
// Already uses explicit per-path fills (ink + muted); embed its body verbatim.
const wordmarkRaw = readFileSync(A("primary-wordmark.svg"), "utf8");
const wordmarkInner = wordmarkRaw
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");
const WORDMARK_VB = { w: 495, h: 53 };

// --- Layout -----------------------------------------------------------------
const iconSize = 132;
const wordmarkH = 38;
const wordmarkW = (WORDMARK_VB.w / WORDMARK_VB.h) * wordmarkH;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.surface}"/>
  <!-- terracotta spine + green base band, echoing the site's footer ground -->
  <rect x="0" y="0" width="14" height="${H}" fill="${C.accentInk}"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${C.ground}"/>

  <!-- brand lockup, top-left -->
  <svg x="${PAD}" y="74" width="${iconSize}" height="${iconSize}" viewBox="0 0 1000 1000">${iconInner}</svg>

  <!-- eyebrow -->
  <text x="${PAD + iconSize + 28}" y="118" font-family="Cabinet Grotesk Extrabold" font-size="26" letter-spacing="2" fill="${C.accentInk}">BACK OFFICE FACTORY</text>
  <text x="${PAD + iconSize + 28}" y="156" font-family="Cabinet Grotesk Medium" font-size="25" fill="${C.muted}">People + AI agents, on one workflow</text>

  <!-- headline -->
  <text x="${PAD}" y="320" font-family="Cabinet Grotesk Extrabold" font-size="82" fill="${C.ink}">Back office team for</text>
  <text x="${PAD}" y="408" font-family="Cabinet Grotesk Extrabold" font-size="82" fill="${C.accentInk}">ecommerce &amp; digital</text>
  <text x="${PAD}" y="496" font-family="Cabinet Grotesk Extrabold" font-size="82" fill="${C.ink}">businesses.</text>

  <!-- footer rule + meta -->
  <rect x="${PAD}" y="546" width="${W - PAD * 2}" height="2" fill="${C.rule}"/>
  <text x="${PAD}" y="592" font-family="Cabinet Grotesk Medium" font-size="27" fill="${C.muted}">Bookkeeping · support · payroll · orders</text>
  <text x="${W - PAD}" y="592" text-anchor="end" font-family="Cabinet Grotesk Extrabold" font-size="27" fill="${C.ground}">backofficefactory.com</text>
</svg>`;

// --- Fonts: woff2 -> sfnt in memory -----------------------------------------
const fontBuffers = await Promise.all(
  ["cabinet-grotesk-800.woff2", "cabinet-grotesk-500.woff2"].map(async (f) =>
    Buffer.from(await wawoff2.decompress(readFileSync(A(join("fonts", f)))))
  )
);

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: W },
  font: { fontBuffers, loadSystemFonts: false },
});
const png = resvg.render().asPng();

mkdirSync(A("og"), { recursive: true });
const out = A(join("og", "social-card.png"));
writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes, ${W}x${H})`);
