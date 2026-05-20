#!/usr/bin/env node
// CI check: keep the locked v2 design system in sync between the two places it lives.
//
// index.html ships its own inline <style> (CLS-tuned, zero render-blocking on the
// primary conversion page) and the 17 SEO landing pages link assets/site.css.
// Both files carry the same design tokens + a shared subset of rules. If they
// drift, the homepage will look correct and the rest of the site will not.
//
// This check runs two diffs:
//   1. CSS custom properties (every `--name: value;`) must match across files.
//   2. A small list of sentinel rules (selectors + key properties) must match.
//
// Exit codes:
//   0 = in sync
//   1 = drift detected (CI failure)
//   2 = script error (missing file, malformed <style> block, etc.)

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_PATH = resolve(repoRoot, 'index.html');
const SITECSS_PATH = resolve(repoRoot, 'assets/site.css');

// Sentinel rules: selector + the properties whose values MUST match across files.
// Add to this list whenever a property drift causes a real bug. Keep it tight;
// every entry is one more thing future edits have to keep in step.
const SENTINELS = [
  { selector: '.proof h2', properties: ['color'] },
  { selector: '.estimate h2', properties: ['color'] },
  { selector: '.qa .peek', properties: ['font-size'] },
  { selector: '.meta dt', properties: ['font-family', 'font-weight', 'font-size'] },
  { selector: '.meta dd', properties: ['font-size', 'max-width'] },
  { selector: '.nav-shell', properties: ['-webkit-backdrop-filter', 'backdrop-filter'] },
];

function loadHomepageCss() {
  const html = readFileSync(INDEX_PATH, 'utf8');
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!m) {
    console.error('error: no <style> block found in index.html');
    process.exit(2);
  }
  return m[1];
}

function loadSiteCss() {
  return readFileSync(SITECSS_PATH, 'utf8');
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

// Extract every `--name: value;` declaration. First occurrence wins (cascade-ish;
// we don't actually evaluate the cascade, just take the canonical declaration).
function extractCustomProperties(css) {
  const cleaned = stripComments(css);
  const props = new Map();
  const re = /--([a-zA-Z0-9_-]+)\s*:\s*([^;}]+)[;}]/g;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const name = m[1];
    const value = m[2].trim().replace(/\s+/g, ' ');
    if (!props.has(name)) props.set(name, value);
  }
  return props;
}

// Find the first declaration block for the exact selector (string match on the
// selector list, with whitespace normalisation). Returns null if not present.
function findRuleBlock(css, selector) {
  const cleaned = stripComments(css);
  // Walk through {} blocks and check if the selector list matches.
  let depth = 0, start = -1, lastSelStart = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{') {
      if (depth === 0) {
        const selectorList = cleaned.slice(lastSelStart, i).trim();
        // Selector matches if any comma-separated part equals the target exactly.
        const parts = selectorList.split(',').map(s => s.replace(/\s+/g, ' ').trim());
        if (parts.includes(selector)) {
          start = i + 1;
        }
      }
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        if (start !== -1) {
          return cleaned.slice(start, i);
        }
        lastSelStart = i + 1;
      }
    }
  }
  return null;
}

// Extract `property: value` pairs from a declaration block. Doesn't handle
// nested rules (we don't have any in this file).
function declarations(block) {
  const out = new Map();
  for (const decl of block.split(/;\s*/)) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim().replace(/\s+/g, ' ');
    if (prop) out.set(prop, val);
  }
  return out;
}

function checkCustomProperties(home, site) {
  const drifts = [];
  const allKeys = new Set([...home.keys(), ...site.keys()]);
  for (const key of [...allKeys].sort()) {
    const h = home.get(key);
    const s = site.get(key);
    if (h === undefined) drifts.push(`  + only in assets/site.css:   --${key}: ${s}`);
    else if (s === undefined) drifts.push(`  + only in index.html:        --${key}: ${h}`);
    else if (h !== s) {
      drifts.push(`  ! value differs           --${key}`);
      drifts.push(`      index.html:           ${h}`);
      drifts.push(`      assets/site.css:      ${s}`);
    }
  }
  return drifts;
}

function checkSentinels(homeCss, siteCss) {
  const drifts = [];
  for (const { selector, properties } of SENTINELS) {
    const homeBlock = findRuleBlock(homeCss, selector);
    const siteBlock = findRuleBlock(siteCss, selector);

    if (homeBlock === null && siteBlock === null) continue;
    if (homeBlock === null) {
      drifts.push(`  ! '${selector}' present in site.css but missing from index.html`);
      continue;
    }
    if (siteBlock === null) {
      drifts.push(`  ! '${selector}' present in index.html but missing from site.css`);
      continue;
    }

    const homeDecls = declarations(homeBlock);
    const siteDecls = declarations(siteBlock);
    for (const prop of properties) {
      const h = homeDecls.get(prop);
      const s = siteDecls.get(prop);
      if (h === undefined && s === undefined) continue;
      if (h !== s) {
        drifts.push(`  ! ${selector} { ${prop} }`);
        drifts.push(`      index.html:      ${h ?? '(missing)'}`);
        drifts.push(`      assets/site.css: ${s ?? '(missing)'}`);
      }
    }
  }
  return drifts;
}

const homeCss = loadHomepageCss();
const siteCss = loadSiteCss();

const tokenDrifts = checkCustomProperties(
  extractCustomProperties(homeCss),
  extractCustomProperties(siteCss),
);
const sentinelDrifts = checkSentinels(homeCss, siteCss);

if (tokenDrifts.length === 0 && sentinelDrifts.length === 0) {
  console.log('✓ Design system in sync between index.html <style> and assets/site.css');
  process.exit(0);
}

console.error('✗ Design drift between index.html <style> and assets/site.css');
console.error('');
console.error('Both files carry the locked v2 design system. They must stay in step,');
console.error('or the homepage will ship a fix the 17 SEO pages never receive.');
console.error('');

if (tokenDrifts.length) {
  console.error('Custom-property drift:');
  for (const line of tokenDrifts) console.error(line);
  console.error('');
}
if (sentinelDrifts.length) {
  console.error('Sentinel-rule drift:');
  for (const line of sentinelDrifts) console.error(line);
  console.error('');
}

console.error('Fix by porting the change from whichever file has it to the other,');
console.error('then re-run: node scripts/check-design-sync.mjs');
process.exit(1);
