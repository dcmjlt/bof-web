#!/usr/bin/env node
/* Back Office Factory — SEO landing page generator.
 *
 * Single source of truth for the 16 templated SEO landing pages (11 /hire role
 * pages + 5 /services category hubs). /about is hand-written separately (it is
 * structurally different — E-E-A-T trust page, only one of it).
 *
 * Design system lives in /assets/site.css (lifted verbatim from index.html's
 * locked v2 <style>). This script only emits per-page HTML. To change the page
 * template, edit TEMPLATE here and re-run:  node scripts/build-landing-pages.mjs
 *
 * Build order + scope decisions: memory project_site_ia_build_order.
 * Every page is noindex,follow until trust artefacts are real (CLAUDE.md ship
 * blocker, same gate as index.html). Do NOT add these URLs to sitemap.xml until
 * noindex is removed.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TEMPLATE = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{TITLE}}</title>
<meta name="description" content="{{META_DESC}}">
<meta name="theme-color" content="#FBF7F0">

<!-- LAUNCH BLOCKER: noindex stays until the placeholder trust artefacts
     (price-honesty quote, named case studies, UK contact, data-protection
     wording, cert status) are real. Same gate as index.html. Tracked in
     CLAUDE.md ship blockers + memory project_site_ia_build_order. -->
<meta name="robots" content="noindex,follow">

<link rel="canonical" href="https://backofficefactory.com/{{PATH}}/">

<meta property="og:type" content="website">
<meta property="og:url" content="https://backofficefactory.com/{{PATH}}/">
<meta property="og:title" content="{{OG_TITLE}}">
<meta property="og:description" content="{{OG_DESC}}">
<meta property="og:locale" content="en_GB">

<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{{TW_TITLE}}">
<meta name="twitter:description" content="{{TW_DESC}}">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://backofficefactory.com/#organization",
      "name": "Back Office Factory",
      "url": "https://backofficefactory.com/",
      "description": "Back-office team that runs growing digital and ecommerce businesses, delivered by real people and AI agents on one workflow, hired by the hour.",
      "foundingDate": "2006"
    },
    {
      "@type": "Service",
      "@id": "https://backofficefactory.com/{{PATH}}/#service",
      "name": "{{SVC_NAME}}",
      "serviceType": "{{SVC_TYPE}}",
      "provider": { "@id": "https://backofficefactory.com/#organization" },
      "areaServed": "GB",
      "description": "{{SVC_DESC}}"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://backofficefactory.com/" },
        { "@type": "ListItem", "position": 2, "name": "{{CRUMB_PARENT}}", "item": "https://backofficefactory.com/#services" },
        { "@type": "ListItem", "position": 3, "name": "{{CRUMB_CURRENT}}" }
      ]
    }
  ]
}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23E8A33D'/%3E%3Ctext x='16' y='22' font-family='Verdana,sans-serif' font-size='17' font-weight='700' text-anchor='middle' fill='%231F1A14'%3EB%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>

<a class="skip" href="#main">Skip to content</a>

<div class="nav-shell" id="navShell">
  <div class="wrap">
    <nav aria-label="Primary">
      <a class="logo" href="/" aria-label="Back Office Factory home">
        <span class="mark" aria-hidden="true">BOF</span>
        <span class="wordmark">Back Office Factory</span>
      </a>
      <div class="navlinks">
        <a href="/#workforce">One workforce</a>
        <a href="/#services">Services</a>
        <a href="/#pricing">Pricing</a>
        <a href="/#proof">Proof</a>
        <a href="/#how">How it works</a>
        <a href="/#faq">FAQ</a>
      </div>
      <div class="nav-cta">
        <a href="/?src={{SRC}}#estimate" class="btn btn-primary btn-sm">Get your estimate</a>
        <details class="mobile">
          <summary aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </summary>
          <div class="menu">
            <a href="/#workforce">One workforce</a>
            <a href="/#services">Services</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#proof">Proof</a>
            <a href="/#how">How it works</a>
            <a href="/#faq">FAQ</a>
            <a href="/?src={{SRC}}#estimate" class="btn btn-primary">Get your estimate</a>
          </div>
        </details>
      </div>
    </nav>
  </div>
</div>

<main id="main">

  <div class="wrap">
    <nav class="crumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li class="sep" aria-hidden="true">/</li>
        <li><a href="/#services">{{CRUMB_PARENT}}</a></li>
        <li class="sep" aria-hidden="true">/</li>
        <li aria-current="page">{{CRUMB_CURRENT}}</li>
      </ol>
    </nav>

    <header class="hero">
      <span class="pill">{{PILL}}</span>
      <h1>{{H1}}</h1>
      <p class="sub">{{HERO_SUB}}</p>
      <p class="dog">The same team runs <b>TicketsToDo, VoucherCodes.ae, DCMnetwork</b> and more.
        We do not take on businesses that compete with us or you.</p>
      <div class="cta-row">
        <a href="/?src={{SRC}}#estimate" class="btn btn-primary">Get your estimate
          <span aria-hidden="true">&rarr;</span></a>
        <a href="/#how" class="btn btn-ghost">How it works</a>
      </div>
      <p class="micro">A real number, early. No runaround.</p>

      <dl class="meta">
        <div><dt>Since 2006</dt><dd>a battle-tested operation, not a startup experiment</dd></div>
        <div><dt>People + AI</dt><dd>the same workflow, you get whichever does the job best</dd></div>
        <div><dt>By the hour</dt><dd>no long contracts, walk away anytime</dd></div>
      </dl>
    </header>
  </div>

  <section aria-labelledby="scope-h">
    <div class="wrap">
      <p class="eyebrow">{{SCOPE_EYEBROW}}</p>
      <h2 class="sec-h" id="scope-h" style="max-width:24ch">{{SCOPE_H}}</h2>
      <p class="deck">{{SCOPE_DECK}}</p>
      <ul class="svc">
{{SCOPE_LIST}}
      </ul>
      <p class="deck" style="margin-top:28px;max-width:62ch">If it is operational and repetitive,
        it is probably something we run. If it sits outside operational delivery, we will tell
        you straight rather than stretch.</p>
    </div>
  </section>

  <section aria-labelledby="wf-h">
    <div class="wrap">
      <p class="eyebrow">One workforce</p>
      <h2 class="sec-h" id="wf-h" style="max-width:18ch">Real people and real AI agents, on the same workflow.</h2>
      <p class="deck">Some work needs judgement. Some is high-volume and repetitive. We run both
        through one workflow, so you get the right mix without managing another AI tool yourself.</p>
      <div class="grid2">
        <article class="card">
          <span class="tag">People</span>
          <h3>Trained operators</h3>
          <p>A real team that learns your business and does the work properly, not a faceless
            queue. Judgement calls and edge cases handled like an owner would.</p>
        </article>
        <article class="card">
          <span class="tag">AI agents</span>
          <h3>Same job, swappable</h3>
          <p>Software agents run the repetitive, high-volume work on the same workflow wherever
            they do it better. You never have to operate or babysit the AI.</p>
        </article>
      </div>
    </div>
  </section>

  <section aria-labelledby="proof-h">
    <div class="wrap">
      <div class="proof">
        <p class="eyebrow">Why us</p>
        <h2 id="proof-h">{{PROOF_H}}</h2>
        <p class="brands">TicketsToDo &middot; VoucherCodes.ae &middot; DCMnetwork &middot; and more</p>
        <p class="nc">The same operation that holds our own products to a high bar runs your
          {{PROOF_WHAT}} to that same bar. We do not take on businesses that compete with us or
          you. Your work and your data stay yours.</p>
      </div>
    </div>
  </section>

  <section aria-labelledby="price-h">
    <div class="wrap">
      <p class="eyebrow">How we work and what it costs</p>
      <div class="price-block">
        <h2 class="vframe" id="price-h">Quality work, priced fairly.</h2>
        <p class="lede">Product-grade quality at honest, reasonable prices, structured so it is
          profitable for you too, not just us.</p>
        <ul class="price-list">
          <li><span class="check" aria-hidden="true">&check;</span> By the hour, you only pay for work delivered</li>
          <li><span class="check" aria-hidden="true">&check;</span> No long contracts, no lock-in, walk away anytime</li>
          <li><span class="check" aria-hidden="true">&check;</span> No hidden fees, no asterisks, no surprise invoices</li>
          <li><span class="check" aria-hidden="true">&check;</span> A straight number at the first conversation</li>
        </ul>
        <a href="/?src={{SRC}}#estimate" class="btn btn-primary" style="margin-top:26px">Get your estimate
          <span aria-hidden="true">&rarr;</span></a>
        <p class="micro">A real number, early. No runaround.</p>
      </div>
    </div>
  </section>

  <section aria-labelledby="faq-h">
    <div class="wrap">
      <p class="eyebrow">Questions</p>
      <h2 class="sec-h" id="faq-h" style="max-width:18ch">What growing teams ask us first.</h2>
      <div class="faq">
        <details class="qa">
          <summary>
            <span class="q">Will you work with a business that competes with mine?</span>
            <span class="peek">No. We run our own digital businesses, so we never take on anyone who competes with you.</span>
          </summary>
          <div class="a">
            <p>No. We run our own digital businesses on this exact team, TicketsToDo,
              VoucherCodes.ae, DCMnetwork and more, so we hold a firm line: we do not take on
              businesses that compete with us or you. Your work, your data and your edge stay
              yours.</p>
          </div>
        </details>
        <details class="qa">
          <summary>
            <span class="q">{{FAQ2_Q}}</span>
            <span class="peek">{{FAQ2_PEEK}}</span>
          </summary>
          <div class="a">
            <p>{{FAQ2_A}}</p>
          </div>
        </details>
        <details class="qa">
          <summary>
            <span class="q">What does it cost?</span>
            <span class="peek">Quality work, priced fairly, by the hour, with a real number early.</span>
          </summary>
          <div class="a">
            <p>Quality work, priced fairly. You are billed by the hour and only pay for work
              delivered, with no long contracts, no lock-in and no hidden fees. You get a real
              indicative range early, then a firm quote after a short conversation.</p>
            <p><a href="/?src={{SRC}}#estimate">Get your estimate &rarr;</a>
              A real number, early. No runaround.</p>
          </div>
        </details>
      </div>
    </div>
  </section>

  <section aria-labelledby="rel-h">
    <div class="wrap">
      <p class="eyebrow">Related</p>
      <h2 class="sec-h" id="rel-h" style="max-width:22ch">Other back-office work digital teams hire from us.</h2>
      <ul class="rel">
{{REL_LIST}}
      </ul>
    </div>
  </section>

  <section aria-labelledby="cta-h">
    <div class="wrap">
      <div class="estimate">
        <p class="eyebrow">Get your estimate</p>
        <h2 id="cta-h">A real number, early. No runaround.</h2>
        <p class="blurb">Tell us roughly what you need run and we will come back with an honest
          indicative range, then a firm quote after a short conversation. No obligation, no
          sales theatre.</p>
        <p class="reassure">Quality work, priced fairly, profitable for you too. By the hour,
          no lock-in.</p>
        <div class="cta-row">
          <a href="/?src={{SRC}}#estimate" class="btn btn-primary">Get your estimate
            <span aria-hidden="true">&rarr;</span></a>
          <a href="/#how" class="btn btn-ghost">How it works</a>
        </div>
      </div>
    </div>
  </section>

</main>

<footer aria-labelledby="footer-h">
  <h2 class="vh" id="footer-h">Back Office Factory</h2>
  <div class="wrap">
    <div class="foot">
      <div>
        <a class="logo" href="/" aria-label="Back Office Factory home">
          <span class="mark" aria-hidden="true">BOF</span> Back Office Factory
        </a>
        <p>The back office that runs growing digital businesses, including our own. Real people
          and AI agents, on the same workflow, hired by the hour.</p>
      </div>
      <div>
        <h3>Contact</h3>
        <ul>
          <li>United Kingdom
            <span class="flag" title="Required launch trust artefact">Placeholder &middot; UK contact route to be confirmed (no email)</span>
          </li>
          <li>We handle your data carefully and under UK data-protection law
            <span class="flag" title="Required launch trust artefact">Placeholder &middot; confirm exact data-protection wording</span>
          </li>
          <li>Security and certification status to be confirmed
            <span class="flag" title="Required launch trust artefact">Placeholder &middot; confirm real cert status</span>
          </li>
        </ul>
      </div>
    </div>
    <nav class="foot-dir" aria-label="Footer">
      <div>
        <details open>
          <summary><h3>Company</h3></summary>
          <ul>
            <li><a href="/#workforce">One workforce</a></li>
            <li><a href="/#services">Services</a></li>
            <li><a href="/#proof">Proof</a></li>
            <li><a href="/#how">How it works</a></li>
            <li><a href="/#faq">FAQ</a></li>
            <li><a href="/about/">About</a></li>
            <li><a href="/?src={{SRC}}#estimate">Get your estimate</a></li>
          </ul>
        </details>
      </div>
      <div>
        <details open>
          <summary><h3>Services</h3></summary>
          <ul>
            <li><a href="/services/customer-support/">Customer support</a></li>
            <li><a href="/services/finance-and-accounting/">Finance &amp; accounting</a></li>
            <li><a href="/services/back-office-automation/">Back-office automation</a></li>
            <li><a href="/services/ai-automation/">AI automation</a></li>
            <li><a href="/services/digital-transformation/">Digital transformation</a></li>
          </ul>
        </details>
      </div>
      <div class="foot-roles">
        <details open>
          <summary><h3>Hire a role</h3></summary>
          <ul class="foot-cols">
            <li><a href="/hire/bookkeeper/">Bookkeeper</a></li>
            <li><a href="/hire/accounts-specialist/">Accounts specialist</a></li>
            <li><a href="/hire/payroll-specialist/">Payroll specialist</a></li>
            <li><a href="/hire/customer-support-specialist/">Customer support specialist</a></li>
            <li><a href="/hire/ecommerce-support-specialist/">Ecommerce support specialist</a></li>
            <li><a href="/hire/order-processing-specialist/">Order processing specialist</a></li>
            <li><a href="/hire/document-processing-specialist/">Document processing specialist</a></li>
            <li><a href="/hire/data-entry-specialist/">Data entry specialist</a></li>
            <li><a href="/hire/virtual-assistant/">Virtual assistant</a></li>
            <li><a href="/hire/administration-assistant/">Administration assistant</a></li>
            <li><a href="/hire/real-estate-data-specialist/">Real estate data specialist</a></li>
          </ul>
        </details>
      </div>
    </nav>
    <div class="foot-base">
      <span>&copy; 2026 Back Office Factory. Operating since 2006.</span>
      <span>No long contracts. No hidden fees. No surprise invoices.</span>
    </div>
  </div>
</footer>

<script>
  // Sticky-nav hairline + JS-free mobile menu close. No form on landing pages.
  (function(){
    var shell=document.getElementById('navShell');
    var tick=false;
    function upd(){shell.dataset.stuck=window.scrollY>8;tick=false;}
    addEventListener('scroll',function(){
      if(!tick){requestAnimationFrame(upd);tick=true;}
    },{passive:true});
    upd();
    var m=document.querySelector('.mobile');
    if(m){m.addEventListener('click',function(e){
      if(e.target.closest('a')) m.removeAttribute('open');
    });}
  })();
</script>

</body>
</html>
`;

const scope = (b, d) =>
  `        <li><span class="mk" aria-hidden="true">&check;</span><span>\n` +
  `          <b>${b}</b><span class="d">${d}</span></span></li>`;

const rel = (href, b, span) =>
  `        <li><a href="${href}">\n` +
  `          <b>${b}</b>\n` +
  `          <span>${span}</span></a></li>`;

// ---- Per-page data ------------------------------------------------------
// type: "role" -> /hire/<slug>/  | "service" -> /services/<slug>/
const PAGES = [
  // ===== TIER A — /hire/{role} (11) =====
  {
    type: "role", slug: "ecommerce-support-specialist",
    title: "Hire an Ecommerce Support Specialist, By the Hour | Back Office Factory",
    metaDesc: "Hire a trained ecommerce support specialist by the hour: customer support, order and returns handling, inbox triage. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire an ecommerce support specialist, by the hour",
    ogDesc: "Customer support, order and returns handling and inbox triage for growing ecommerce businesses, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Ecommerce customer support, order and returns handling and inbox triage by people and AI agents, hired by the hour.",
    svcName: "Ecommerce support specialist",
    svcType: "Ecommerce customer support, order and returns handling, inbox triage",
    svcDesc: "A trained ecommerce support specialist, backed by AI agents on one workflow, handling customer support, order and returns processing and inbox triage for growing ecommerce businesses, hired by the hour.",
    h1: "Hire an ecommerce support specialist, by the hour.",
    heroSub: "A trained operator who handles your customer support, order and returns questions and inbox triage, backed by AI agents on the same workflow so the repetitive volume gets faster without losing judgement.",
    scopeEyebrow: "What an ecommerce support specialist runs",
    scopeH: "The ecommerce support work that scales faster than you can hire for it.",
    scopeDeck: "The customer-facing operational work that grows with order volume, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Customer support &amp; tickets", "Pre-sale and post-sale questions answered, the right things escalated."],
      ["Order &amp; delivery queries", "Where-is-my-order, address fixes and delivery exceptions handled."],
      ["Returns &amp; refunds", "Returns processed and refunds actioned cleanly to policy."],
      ["Inbox &amp; channel triage", "Shared inbox, chat and marketplace messages sorted and answered."],
      ["Marketplace case handling", "A-to-z claims, disputes and seller messages worked through."],
      ["Order exceptions", "Stuck, duplicate and problem orders chased to resolution."],
    ],
    proofH: "We run our own ecommerce and digital businesses on this exact team.",
    proofWhat: "ecommerce support",
    faq2Q: "Do you work in our existing helpdesk and tools?",
    faq2Peek: "Yes. The operator works in your stack and channels, not a separate system you have to learn.",
    faq2A: "Yes. The specialist works inside your helpdesk, shared inbox, chat and marketplace channels. You do not adopt a new tool or process to get support covered.",
    rel: [
      ["/hire/customer-support-specialist/", "Customer support specialist", "Support and inbox triage across any digital business, not only ecommerce."],
      ["/hire/order-processing-specialist/", "Order processing specialist", "Orders, exceptions and returns moved through cleanly at volume."],
      ["/services/customer-support/", "Customer support, as a service", "The full support operation, people and AI agents on one workflow."],
    ],
  },
  {
    type: "role", slug: "customer-support-specialist",
    title: "Hire a Customer Support Specialist, By the Hour | Back Office Factory",
    metaDesc: "Hire a trained customer support specialist by the hour: tickets, live chat, inbox triage and escalations. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire a customer support specialist, by the hour",
    ogDesc: "Tickets, live chat, inbox triage and escalations for growing digital businesses, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Tickets, live chat, inbox triage and escalations by people and AI agents, hired by the hour.",
    svcName: "Customer support specialist",
    svcType: "Customer support, live chat, inbox triage, escalations",
    svcDesc: "A trained customer support specialist, backed by AI agents on one workflow, handling tickets, live chat, inbox triage and escalations for growing digital businesses, hired by the hour.",
    h1: "Hire a customer support specialist, by the hour.",
    heroSub: "A trained operator who handles your tickets, live chat, inbox triage and escalations, backed by AI agents on the same workflow so high-volume support gets faster without losing judgement.",
    scopeEyebrow: "What a customer support specialist runs",
    scopeH: "The support work that grows with your customer base.",
    scopeDeck: "The customer-facing operational work that scales with your business, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Ticket handling", "Inbound questions answered to your tone and policy, end to end."],
      ["Live chat &amp; messaging", "Real-time chat and social messages covered during your hours."],
      ["Inbox &amp; channel triage", "Shared inboxes sorted, routed and prioritised so nothing is lost."],
      ["Escalation handling", "The right cases flagged and routed to you with context, fast."],
      ["Follow-ups &amp; resolution", "Open cases chased to a clean close, not left to age out."],
      ["Macros &amp; knowledge upkeep", "Saved replies and help content kept current as you change."],
    ],
    proofH: "We run our own digital businesses on this exact team.",
    proofWhat: "support",
    faq2Q: "Do you work in our existing helpdesk?",
    faq2Peek: "Yes. The operator works in your stack and channels, not a separate system you have to learn.",
    faq2A: "Yes. The specialist works inside your existing helpdesk, shared inbox, chat and social channels. You do not adopt a new tool or process to get support covered.",
    rel: [
      ["/hire/ecommerce-support-specialist/", "Ecommerce support specialist", "Support tuned to orders, returns and marketplace cases."],
      ["/hire/order-processing-specialist/", "Order processing specialist", "Orders, exceptions and returns moved through cleanly at volume."],
      ["/services/customer-support/", "Customer support, as a service", "The full support operation, people and AI agents on one workflow."],
    ],
  },
  {
    type: "role", slug: "order-processing-specialist",
    title: "Hire an Order Processing Specialist, By the Hour | Back Office Factory",
    metaDesc: "Hire a trained order processing specialist by the hour: order entry, exceptions, returns and fulfilment coordination. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire an order processing specialist, by the hour",
    ogDesc: "Order entry, exceptions, returns and fulfilment coordination for growing digital businesses, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Order entry, exceptions, returns and fulfilment coordination by people and AI agents, hired by the hour.",
    svcName: "Order processing specialist",
    svcType: "Order entry, order exceptions, returns, fulfilment coordination",
    svcDesc: "A trained order processing specialist, backed by AI agents on one workflow, handling order entry, exceptions, returns and fulfilment coordination for growing digital businesses, hired by the hour.",
    h1: "Hire an order processing specialist, by the hour.",
    heroSub: "A trained operator who keeps orders, exceptions and returns moving cleanly, backed by AI agents on the same workflow so volume gets faster without errors creeping in.",
    scopeEyebrow: "What an order processing specialist runs",
    scopeH: "Orders moving cleanly, even when volume spikes.",
    scopeDeck: "The order operations that quietly break as a business grows, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Order entry &amp; checks", "Orders entered and validated accurately across your channels."],
      ["Order exceptions", "Stuck, duplicate, failed and problem orders chased to resolution."],
      ["Returns &amp; refunds", "Returns processed and refunds actioned cleanly to policy."],
      ["Fulfilment coordination", "Warehouse, courier and supplier back-and-forth handled."],
      ["Marketplace orders", "Multi-channel and marketplace orders reconciled and processed."],
      ["Order data accuracy", "Status, tracking and records kept clean and current."],
    ],
    proofH: "We run our own ecommerce and digital businesses on this exact team.",
    proofWhat: "order operations",
    faq2Q: "Can you handle peak and seasonal spikes?",
    faq2Peek: "Yes. You scale hours up and down by the hour; the AI workflow absorbs repetitive volume.",
    faq2A: "Yes. You scale hours up and down by the hour as volume moves, and the AI agents on the same workflow absorb the repetitive load so peaks do not turn into backlogs or errors.",
    rel: [
      ["/hire/ecommerce-support-specialist/", "Ecommerce support specialist", "Customer-facing order and returns questions handled."],
      ["/hire/document-processing-specialist/", "Document processing specialist", "The paperwork and data behind orders kept clean."],
      ["/services/back-office-automation/", "Back-office automation", "Repetitive order work automated and run end to end."],
    ],
  },
  {
    type: "role", slug: "bookkeeper",
    title: "Hire a Bookkeeper, By the Hour | Back Office Factory",
    metaDesc: "Hire a bookkeeper by the hour: day-to-day books, bank reconciliation, invoicing and month-end prep. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire a bookkeeper, by the hour",
    ogDesc: "Day-to-day books, bank reconciliation, invoicing and month-end prep for growing digital businesses, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Day-to-day books, reconciliation, invoicing and month-end prep by people and AI agents, hired by the hour.",
    svcName: "Bookkeeper",
    svcType: "Bookkeeping, bank reconciliation, invoicing, month-end preparation",
    svcDesc: "A bookkeeper, backed by AI agents on one workflow, keeping day-to-day books current, reconciling accounts, handling invoicing and preparing month-end for growing digital businesses, hired by the hour.",
    h1: "Hire a bookkeeper, by the hour.",
    heroSub: "A bookkeeper who keeps your day-to-day books current and clean and your month-end ready, backed by AI agents on the same workflow so reconciliation and entry get faster without losing accuracy.",
    scopeEyebrow: "What a bookkeeper runs",
    scopeH: "Books kept current, clean and ready, not left to pile up.",
    scopeDeck: "The recurring finance admin that slips when you are busy growing, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Day-to-day bookkeeping", "Transactions recorded and categorised, books kept current."],
      ["Bank &amp; card reconciliation", "Accounts matched and reconciled on a regular schedule."],
      ["Invoicing &amp; bills", "Sales invoices raised, supplier bills logged and tracked."],
      ["Expense processing", "Expenses and receipts captured, categorised and filed."],
      ["Month-end preparation", "Books tidied and prepared so close is not a scramble."],
      ["Accountant liaison", "Clean records handed to your accountant for filing."],
    ],
    proofH: "We run the books on our own digital businesses with this exact team.",
    proofWhat: "books",
    faq2Q: "Do you replace our accountant?",
    faq2Peek: "No. We run the day-to-day books and hand clean records to your accountant for filing.",
    faq2A: "No. We run the day-to-day bookkeeping and keep records clean and current. Statutory filing, tax advice and accounts sign-off stay with your accountant; we hand them tidy books to work from.",
    rel: [
      ["/hire/accounts-specialist/", "Accounts specialist", "AP, AR, invoicing and credit control handled."],
      ["/hire/payroll-specialist/", "Payroll specialist", "Payroll prepared and kept on schedule."],
      ["/services/finance-and-accounting/", "Finance &amp; accounting support", "The full finance back office on one workflow."],
    ],
  },
  {
    type: "role", slug: "virtual-assistant",
    title: "Hire a Virtual Assistant, By the Hour | Back Office Factory",
    metaDesc: "Hire a virtual assistant by the hour: inbox and calendar, scheduling, research, document prep and follow-ups. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire a virtual assistant, by the hour",
    ogDesc: "Inbox and calendar, scheduling, research, document prep and follow-ups for busy founders, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Inbox, calendar, scheduling, research and follow-ups by people and AI agents, hired by the hour.",
    svcName: "Virtual assistant",
    svcType: "Inbox and calendar management, scheduling, research, document preparation",
    svcDesc: "A virtual assistant, backed by AI agents on one workflow, handling inbox and calendar, scheduling, research, document prep and follow-ups for busy founders and teams, hired by the hour.",
    h1: "Hire a virtual assistant, by the hour.",
    heroSub: "A capable assistant who handles your inbox, calendar, scheduling, research and follow-ups, backed by AI agents on the same workflow so the repetitive admin gets faster without dropping balls.",
    scopeEyebrow: "What a virtual assistant runs",
    scopeH: "The admin that quietly eats your week, off your plate.",
    scopeDeck: "The recurring personal-and-business admin that slows a busy founder down, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Inbox &amp; calendar", "Email triaged, meetings booked, calendar kept clean."],
      ["Scheduling &amp; coordination", "Meetings, calls and logistics arranged across time zones."],
      ["Research &amp; summaries", "Background research pulled together into usable summaries."],
      ["Document preparation", "Decks, docs and templates drafted and formatted."],
      ["Data entry &amp; updates", "Records, CRM and trackers kept current and tidy."],
      ["Follow-ups &amp; chasing", "Open threads, suppliers and to-dos chased to closed."],
    ],
    proofH: "We run our own digital businesses on this exact team.",
    proofWhat: "admin",
    faq2Q: "Is it always the same person?",
    faq2Peek: "You get a consistent operator who learns your preferences, backed by the wider team and AI.",
    faq2A: "You get a consistent operator who learns how you work and your preferences, backed by the wider team and AI agents on the same workflow so cover and capacity are never a single point of failure.",
    rel: [
      ["/hire/administration-assistant/", "Administration assistant", "Broader business admin, records and coordination."],
      ["/hire/data-entry-specialist/", "Data entry specialist", "High-volume, accurate data entry and cleanup."],
      ["/services/back-office-automation/", "Back-office automation", "Repetitive admin automated and run end to end."],
    ],
  },
  {
    type: "role", slug: "administration-assistant",
    title: "Hire an Administration Assistant, By the Hour | Back Office Factory",
    metaDesc: "Hire an administration assistant by the hour: business admin, records, scheduling, supplier coordination and reporting prep. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire an administration assistant, by the hour",
    ogDesc: "Business admin, records, scheduling, supplier coordination and reporting prep for growing teams, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Business admin, records, scheduling and supplier coordination by people and AI agents, hired by the hour.",
    svcName: "Administration assistant",
    svcType: "Business administration, records, scheduling, supplier coordination",
    svcDesc: "An administration assistant, backed by AI agents on one workflow, handling business admin, records, scheduling, supplier coordination and reporting prep for growing teams, hired by the hour.",
    h1: "Hire an administration assistant, by the hour.",
    heroSub: "A reliable operator who handles your business admin, records, scheduling and supplier coordination, backed by AI agents on the same workflow so the recurring work gets faster without slipping.",
    scopeEyebrow: "What an administration assistant runs",
    scopeH: "The recurring business admin that keeps a team moving.",
    scopeDeck: "The operational admin that grows with headcount and activity, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["General business admin", "The recurring operational admin that keeps the week moving."],
      ["Document processing", "Paperwork, forms and filing handled and kept in order."],
      ["Records &amp; data updates", "Systems, CRM and trackers kept accurate and current."],
      ["Scheduling &amp; coordination", "Meetings, logistics and internal coordination arranged."],
      ["Supplier coordination", "Chasing, scheduling and back-and-forth with suppliers."],
      ["Reporting preparation", "Recurring reports pulled together and formatted on time."],
    ],
    proofH: "We run our own digital businesses on this exact team.",
    proofWhat: "admin",
    faq2Q: "Can you cover several admin areas at once?",
    faq2Peek: "Yes. One operator plus the AI workflow covers a mix, scaled by the hour as needs change.",
    faq2A: "Yes. One operator backed by AI agents on the same workflow can cover a mix of admin areas, and you scale the hours up or down as the work changes. No long contracts.",
    rel: [
      ["/hire/virtual-assistant/", "Virtual assistant", "Founder-facing inbox, calendar and follow-up support."],
      ["/hire/document-processing-specialist/", "Document processing specialist", "Document intake, extraction and filing at volume."],
      ["/hire/data-entry-specialist/", "Data entry specialist", "High-volume, accurate data entry and cleanup."],
    ],
  },
  {
    type: "role", slug: "data-entry-specialist",
    title: "Hire a Data Entry Specialist, By the Hour | Back Office Factory",
    metaDesc: "Hire a data entry specialist by the hour: high-volume entry, migration, cleanup, deduplication and CRM hygiene. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire a data entry specialist, by the hour",
    ogDesc: "High-volume data entry, migration, cleanup, deduplication and CRM hygiene, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "High-volume data entry, migration, cleanup and CRM hygiene by people and AI agents, hired by the hour.",
    svcName: "Data entry specialist",
    svcType: "Data entry, data migration, data cleanup, deduplication, CRM hygiene",
    svcDesc: "A data entry specialist, backed by AI agents on one workflow, handling high-volume entry, migration, cleanup, deduplication and CRM hygiene for growing digital businesses, hired by the hour.",
    h1: "Hire a data entry specialist, by the hour.",
    heroSub: "A careful operator who handles your high-volume data entry, migration and cleanup, backed by AI agents on the same workflow so accuracy holds even as volume climbs.",
    scopeEyebrow: "What a data entry specialist runs",
    scopeH: "High-volume data, entered accurately and kept clean.",
    scopeDeck: "The data work that piles up and degrades as a business grows, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["High-volume data entry", "Large, repetitive entry handled accurately and on schedule."],
      ["Data migration", "Records moved between systems cleanly and verified."],
      ["Cleanup &amp; deduplication", "Messy, duplicated data tidied into a usable state."],
      ["Catalogue &amp; product data", "Product, listing and catalogue data built and maintained."],
      ["CRM hygiene", "Contact and pipeline data kept accurate and current."],
      ["Validation &amp; formatting", "Records checked, standardised and formatted to spec."],
    ],
    proofH: "We run our own digital businesses on this exact team.",
    proofWhat: "data",
    faq2Q: "How do you keep accuracy high at volume?",
    faq2Peek: "AI agents do the repetitive entry; people validate and handle judgement. Same workflow.",
    faq2A: "AI agents on the workflow handle the repetitive entry at speed, and trained people validate, handle exceptions and own the judgement calls. You get volume and accuracy, not one at the cost of the other.",
    rel: [
      ["/hire/document-processing-specialist/", "Document processing specialist", "Document intake, extraction and indexing at volume."],
      ["/hire/administration-assistant/", "Administration assistant", "Broader business admin, records and coordination."],
      ["/services/back-office-automation/", "Back-office automation", "Repetitive data work automated and run end to end."],
    ],
  },
  {
    type: "role", slug: "payroll-specialist",
    title: "Hire a Payroll Specialist, By the Hour | Back Office Factory",
    metaDesc: "Hire a payroll specialist by the hour: payroll preparation, starters and leavers, timesheets and payslip distribution admin. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire a payroll specialist, by the hour",
    ogDesc: "Payroll preparation, starters and leavers, timesheets and payslip distribution admin, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Payroll preparation, starters and leavers and timesheet admin by people and AI agents, hired by the hour.",
    svcName: "Payroll specialist",
    svcType: "Payroll preparation, starters and leavers, timesheets, payslip distribution",
    svcDesc: "A payroll specialist, backed by AI agents on one workflow, handling payroll preparation, starters and leavers, timesheets and payslip distribution admin for growing digital businesses, hired by the hour.",
    h1: "Hire a payroll specialist, by the hour.",
    heroSub: "A payroll operator who keeps your payroll prepared, accurate and on schedule, backed by AI agents on the same workflow so the recurring admin stays right every cycle.",
    scopeEyebrow: "What a payroll specialist runs",
    scopeH: "Payroll prepared and on schedule, every cycle.",
    scopeDeck: "The recurring payroll admin that has to be right every time, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Payroll preparation", "Each cycle prepared accurately and on schedule."],
      ["Starters &amp; leavers", "New joiners and leavers processed correctly and on time."],
      ["Timesheets &amp; inputs", "Hours, variances and inputs collected, checked and entered."],
      ["Deductions admin", "Statutory and standard deductions administered each run."],
      ["Payslip distribution", "Payslips prepared and distributed to schedule."],
      ["Provider liaison", "Coordination with your payroll provider and your accountant."],
    ],
    proofH: "We run payroll admin on our own digital businesses with this exact team.",
    proofWhat: "payroll admin",
    faq2Q: "Do you give payroll or tax advice?",
    faq2Peek: "No. We run the payroll admin accurately; regulated advice and filing stay with your provider.",
    faq2A: "No. We run the recurring payroll administration accurately and on schedule. Regulated payroll and tax advice, statutory filing and sign-off stay with your payroll provider or accountant; we keep the operational work clean for them.",
    rel: [
      ["/hire/bookkeeper/", "Bookkeeper", "Day-to-day books kept current and clean."],
      ["/hire/accounts-specialist/", "Accounts specialist", "AP, AR, invoicing and credit control handled."],
      ["/services/finance-and-accounting/", "Finance &amp; accounting support", "The full finance back office on one workflow."],
    ],
  },
  {
    type: "role", slug: "accounts-specialist",
    title: "Hire an Accounts Specialist, By the Hour | Back Office Factory",
    metaDesc: "Hire an accounts specialist by the hour: accounts payable and receivable, invoicing, credit control and reconciliation. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire an accounts specialist, by the hour",
    ogDesc: "Accounts payable and receivable, invoicing, credit control and reconciliation, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Accounts payable and receivable, invoicing and credit control by people and AI agents, hired by the hour.",
    svcName: "Accounts specialist",
    svcType: "Accounts payable, accounts receivable, invoicing, credit control, reconciliation",
    svcDesc: "An accounts specialist, backed by AI agents on one workflow, handling accounts payable and receivable, invoicing, credit control and reconciliation for growing digital businesses, hired by the hour.",
    h1: "Hire an accounts specialist, by the hour.",
    heroSub: "An accounts operator who keeps payables, receivables and invoicing moving and your cash position clean, backed by AI agents on the same workflow so chasing and matching get faster.",
    scopeEyebrow: "What an accounts specialist runs",
    scopeH: "Payables, receivables and invoicing kept moving.",
    scopeDeck: "The accounts operations that affect cash flow when they slip, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Accounts payable", "Supplier bills logged, scheduled and prepared for payment."],
      ["Accounts receivable", "Customer invoices raised, tracked and reconciled."],
      ["Invoicing", "Accurate, timely invoicing kept on a reliable schedule."],
      ["Credit control", "Overdue invoices chased professionally and persistently."],
      ["Reconciliation", "Accounts and statements matched and tied out regularly."],
      ["Expense processing", "Expenses captured, categorised and reconciled."],
    ],
    proofH: "We run accounts on our own digital businesses with this exact team.",
    proofWhat: "accounts",
    faq2Q: "Do you replace our accountant or finance lead?",
    faq2Peek: "No. We run the operational accounts work; advice, sign-off and strategy stay with you.",
    faq2A: "No. We run the operational accounts work, payables, receivables, invoicing, credit control and reconciliation. Financial advice, sign-off and strategy stay with your accountant or finance lead; we keep the day-to-day clean for them.",
    rel: [
      ["/hire/bookkeeper/", "Bookkeeper", "Day-to-day books kept current and clean."],
      ["/hire/payroll-specialist/", "Payroll specialist", "Payroll prepared and kept on schedule."],
      ["/services/finance-and-accounting/", "Finance &amp; accounting support", "The full finance back office on one workflow."],
    ],
  },
  {
    type: "role", slug: "document-processing-specialist",
    title: "Hire a Document Processing Specialist, By the Hour | Back Office Factory",
    metaDesc: "Hire a document processing specialist by the hour: document intake, data extraction, indexing, digitisation and records management. Real people and AI agents on one workflow. A real number, early.",
    ogTitle: "Hire a document processing specialist, by the hour",
    ogDesc: "Document intake, data extraction, indexing, digitisation and records management, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Document intake, data extraction, indexing and records management by people and AI agents, hired by the hour.",
    svcName: "Document processing specialist",
    svcType: "Document intake, data extraction, indexing, digitisation, records management",
    svcDesc: "A document processing specialist, backed by AI agents on one workflow, handling document intake, data extraction, indexing, digitisation and records management for growing digital businesses, hired by the hour.",
    h1: "Hire a document processing specialist, by the hour.",
    heroSub: "An operator who turns your document backlog into clean, structured, findable data, backed by AI agents on the same workflow so extraction and indexing get faster without errors.",
    scopeEyebrow: "What a document processing specialist runs",
    scopeH: "Documents turned into clean, structured, findable data.",
    scopeDeck: "The document and paperwork load that grows quietly until it is a problem, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Document intake", "Incoming documents received, sorted and logged consistently."],
      ["Classification", "Documents identified and categorised to your scheme."],
      ["Data extraction", "Key fields extracted from documents into structured data."],
      ["Indexing &amp; filing", "Documents indexed and filed so they are findable later."],
      ["Digitisation", "Paper and image documents digitised and made searchable."],
      ["Validation &amp; records", "Extracted data checked and records kept accurate."],
    ],
    proofH: "We run our own digital businesses on this exact team.",
    proofWhat: "documents",
    faq2Q: "Can you clear an existing backlog and then keep it current?",
    faq2Peek: "Yes. We clear the backlog at scale, then run intake ongoing so it stays clear.",
    faq2A: "Yes. We clear the existing backlog at scale with AI agents on the workflow handling the repetitive extraction, then run ongoing intake so it stays current instead of building back up.",
    rel: [
      ["/hire/data-entry-specialist/", "Data entry specialist", "High-volume, accurate data entry and cleanup."],
      ["/hire/administration-assistant/", "Administration assistant", "Broader business admin, records and coordination."],
      ["/services/back-office-automation/", "Back-office automation", "Repetitive document work automated and run end to end."],
    ],
  },
  {
    type: "role", slug: "real-estate-data-specialist",
    title: "Hire a Real Estate Data Specialist, By the Hour | Back Office Factory",
    metaDesc: "Hire a real estate data specialist by the hour: property and listing data entry, portal and CRM updates, comparables research and document data. Real people and AI agents on one workflow.",
    ogTitle: "Hire a real estate data specialist, by the hour",
    ogDesc: "Property and listing data entry, portal and CRM updates, comparables research and document data, by real people and AI agents on one workflow, hired by the hour.",
    twDesc: "Property and listing data, portal and CRM updates and comparables research by people and AI agents, hired by the hour.",
    svcName: "Real estate data specialist",
    svcType: "Property and listing data entry, portal and CRM updates, comparables research",
    svcDesc: "A real estate data specialist, backed by AI agents on one workflow, handling property and listing data entry, portal and CRM updates, comparables research and document data, hired by the hour.",
    h1: "Hire a real estate data specialist, by the hour.",
    heroSub: "An operator who keeps your property listings, portals and CRM accurate and your research data ready, backed by AI agents on the same workflow so repetitive updates get faster.",
    scopeEyebrow: "What a real estate data specialist runs",
    scopeH: "Property data kept accurate across portals and CRM.",
    scopeDeck: "The repetitive property data work that has to stay accurate everywhere, handled by a real person plus AI agents on one workflow.",
    scope: [
      ["Listing data entry", "Property listings created and maintained accurately."],
      ["Portal updates", "Listings kept current and consistent across portals."],
      ["CRM updates", "Contacts, leads and property records kept clean."],
      ["Comparables research", "Comparable and market data gathered and structured."],
      ["Document data", "Lease, contract and property document data captured."],
      ["Data cleanup", "Inconsistent and duplicated property data tidied."],
    ],
    proofH: "We run data operations on our own digital businesses with this exact team.",
    proofWhat: "property data",
    faq2Q: "Do you work across multiple portals and our CRM?",
    faq2Peek: "Yes. We keep listings and records consistent across portals and your CRM.",
    faq2A: "Yes. We keep property and listing data consistent across the portals you use and your CRM, with AI agents on the workflow handling the repetitive cross-posting and people owning accuracy.",
    rel: [
      ["/hire/data-entry-specialist/", "Data entry specialist", "High-volume, accurate data entry and cleanup."],
      ["/hire/document-processing-specialist/", "Document processing specialist", "Document intake, extraction and indexing at volume."],
      ["/services/back-office-automation/", "Back-office automation", "Repetitive data work automated and run end to end."],
    ],
  },

  // ===== TIER B — /services/{category} (5) =====
  {
    type: "service", slug: "back-office-automation",
    title: "Back-Office Automation, Run by People and AI | Back Office Factory",
    metaDesc: "Back-office automation delivered as an operation: repetitive process work mapped, automated and run by people and AI agents on one workflow, hired by the hour. A real number, early.",
    ogTitle: "Back-office automation, run by people and AI",
    ogDesc: "Repetitive back-office processes mapped, automated and run end to end by people and AI agents on one workflow, hired by the hour.",
    twDesc: "Repetitive back-office processes automated and run by people and AI agents, hired by the hour.",
    svcName: "Back-office automation",
    svcType: "Back-office process automation and operations delivery",
    svcDesc: "Back-office automation delivered as an operation: repetitive processes mapped, automated and run end to end by real people and AI agents on one workflow, for growing digital businesses, hired by the hour.",
    h1: "Back-office automation, run by people and AI.",
    heroSub: "We do not just hand you automation software. We map the repetitive work, build the automation around it and run it as an operation, with people on the same workflow for the judgement calls.",
    scopeEyebrow: "What back-office automation covers",
    scopeH: "The repetitive work, mapped, automated and actually run.",
    scopeDeck: "Automation only pays off when someone runs and maintains it. We do both, on one workflow.",
    scope: [
      ["Process mapping", "The repetitive work documented before anything is automated."],
      ["Workflow automation", "Recurring steps automated and wired into your tools."],
      ["Task automation", "High-volume repetitive tasks run by agents on the workflow."],
      ["Exception handling", "People handle the cases automation should not decide alone."],
      ["Reconciliation automation", "Matching and tie-outs automated and checked."],
      ["Reporting automation", "Recurring reports produced and delivered on schedule."],
    ],
    proofH: "We built this automation running our own digital businesses.",
    proofWhat: "operations",
    faq2Q: "Is this software we have to operate, or do you run it?",
    faq2Peek: "We run it. The intelligence sits in the workflow, not in a tool you have to babysit.",
    faq2A: "We run it. The automation and the people sit on one workflow that we operate and maintain. You get the outcome, not another system to learn, staff and babysit.",
    rel: [
      ["/services/ai-automation/", "AI automation", "Where AI agents do the repetitive work, with human review."],
      ["/hire/data-entry-specialist/", "Data entry specialist", "High-volume, accurate data entry and cleanup."],
      ["/hire/order-processing-specialist/", "Order processing specialist", "Orders, exceptions and returns at volume."],
    ],
  },
  {
    type: "service", slug: "ai-automation",
    title: "AI Automation for Back-Office Operations | Back Office Factory",
    metaDesc: "AI automation for back-office operations: support, document and data work run by AI agents with human-in-the-loop review, on one workflow, hired by the hour. A real number, early.",
    ogTitle: "AI automation for back-office operations",
    ogDesc: "Support, document and data work run by AI agents with human-in-the-loop review, on one workflow, hired by the hour.",
    twDesc: "Back-office work run by AI agents with human-in-the-loop review, hired by the hour.",
    svcName: "AI automation",
    svcType: "AI agent automation for back-office operations with human-in-the-loop review",
    svcDesc: "AI automation for back-office operations: support, document and data work run by AI agents with human-in-the-loop review on one workflow, for growing digital businesses, hired by the hour.",
    h1: "AI automation for back-office operations.",
    heroSub: "AI agents run the repetitive, high-volume back-office work on the same workflow as our people, who handle judgement and review. You get speed without handing the business to a bot.",
    scopeEyebrow: "What AI automation covers",
    scopeH: "AI agents on the repetitive work, people on the judgement.",
    scopeDeck: "AI is a delivery method here, not a headline. It runs where it does the job best, with people in the loop.",
    scope: [
      ["Support automation", "High-volume, repeatable tickets handled by agents, people on edge cases."],
      ["Document &amp; data extraction", "Fields pulled from documents at speed, then validated."],
      ["Triage automation", "Inbound work classified and routed automatically."],
      ["Reconciliation", "Matching and tie-outs run by agents and checked by people."],
      ["Repetitive task agents", "Recurring multi-step tasks run end to end on the workflow."],
      ["Human-in-the-loop review", "People review, correct and own the judgement calls."],
    ],
    proofH: "We run AI on our own digital businesses, on this exact workflow.",
    proofWhat: "operations",
    faq2Q: "Will AI make decisions about our customers or money unsupervised?",
    faq2Peek: "No. Agents do the repetitive work; people own judgement and review the rest.",
    faq2A: "No. AI agents handle the repetitive, high-volume work, and trained people own the judgement calls and review the rest on the same workflow. You get the speed of automation with a human accountable for the outcome.",
    rel: [
      ["/services/back-office-automation/", "Back-office automation", "The full repetitive operation mapped, automated and run."],
      ["/services/customer-support/", "Customer support, as a service", "Support delivered by people and AI on one workflow."],
      ["/hire/document-processing-specialist/", "Document processing specialist", "Document intake, extraction and indexing at volume."],
    ],
  },
  {
    type: "service", slug: "finance-and-accounting",
    title: "Finance and Accounting Support, By the Hour | Back Office Factory",
    metaDesc: "Finance and accounting support, by the hour: bookkeeping, reconciliation, accounts payable and receivable, payroll admin and month-end prep. People and AI agents on one workflow.",
    ogTitle: "Finance and accounting support, by the hour",
    ogDesc: "Bookkeeping, reconciliation, accounts payable and receivable, payroll admin and month-end prep, by people and AI agents on one workflow, hired by the hour.",
    twDesc: "Bookkeeping, reconciliation, AP/AR and payroll admin by people and AI agents, hired by the hour.",
    svcName: "Finance and accounting support",
    svcType: "Bookkeeping, reconciliation, accounts payable and receivable, payroll admin, month-end preparation",
    svcDesc: "Finance and accounting support: bookkeeping, reconciliation, accounts payable and receivable, payroll admin and month-end prep, by real people and AI agents on one workflow, for growing digital businesses, hired by the hour.",
    h1: "Finance and accounting support, by the hour.",
    heroSub: "The recurring finance back office, bookkeeping, reconciliation, payables, receivables and payroll admin, run by people and AI agents on one workflow, with your accountant kept in clean records.",
    scopeEyebrow: "What finance and accounting support covers",
    scopeH: "The finance back office, kept current and clean.",
    scopeDeck: "The recurring finance operations that slip when you are growing, handled on one workflow.",
    scope: [
      ["Bookkeeping", "Day-to-day books recorded and kept current."],
      ["Reconciliation", "Bank, card and account reconciliation on schedule."],
      ["Accounts payable", "Supplier bills logged, scheduled and prepared."],
      ["Accounts receivable", "Invoicing, tracking and credit control handled."],
      ["Payroll admin", "Payroll prepared and kept on schedule each cycle."],
      ["Month-end preparation", "Books tidied so close is not a scramble."],
    ],
    proofH: "We run finance operations on our own digital businesses.",
    proofWhat: "finance back office",
    faq2Q: "Do you replace our accountant?",
    faq2Peek: "No. We run the operational finance work; advice, filing and sign-off stay with your accountant.",
    faq2A: "No. We run the recurring operational finance work and keep records clean and current. Statutory filing, tax advice and accounts sign-off stay with your accountant; we hand them tidy books to work from.",
    rel: [
      ["/hire/bookkeeper/", "Bookkeeper", "Day-to-day books kept current and clean."],
      ["/hire/accounts-specialist/", "Accounts specialist", "AP, AR, invoicing and credit control handled."],
      ["/hire/payroll-specialist/", "Payroll specialist", "Payroll prepared and kept on schedule."],
    ],
  },
  {
    type: "service", slug: "customer-support",
    title: "Customer Support, as a Service | Back Office Factory",
    metaDesc: "Customer support as a service: tickets, live chat, inbox triage, escalations and order or returns queries, by people and AI agents on one workflow, hired by the hour. A real number, early.",
    ogTitle: "Customer support, as a service",
    ogDesc: "Tickets, live chat, inbox triage, escalations and order or returns queries, by people and AI agents on one workflow, hired by the hour.",
    twDesc: "Tickets, live chat, inbox triage and escalations by people and AI agents, hired by the hour.",
    svcName: "Customer support, as a service",
    svcType: "Customer support operations: tickets, live chat, inbox triage, escalations",
    svcDesc: "Customer support delivered as a service: tickets, live chat, inbox triage, escalations and order or returns queries, by real people and AI agents on one workflow, for growing digital businesses, hired by the hour.",
    h1: "Customer support, as a service.",
    heroSub: "The full support operation, tickets, live chat, triage and escalations, run by real people and AI agents on one workflow, in your tools and your tone, scaled by the hour.",
    scopeEyebrow: "What customer support as a service covers",
    scopeH: "The whole support operation, not just bodies on tickets.",
    scopeDeck: "Support that scales with your customer base, run on one workflow in your stack.",
    scope: [
      ["Ticket handling", "Inbound questions answered to your tone and policy."],
      ["Live chat &amp; messaging", "Real-time chat and social messages covered."],
      ["Inbox &amp; channel triage", "Shared inboxes sorted, routed and prioritised."],
      ["Escalation handling", "The right cases flagged and routed with context."],
      ["Order &amp; returns queries", "Order, delivery and returns questions resolved."],
      ["Knowledge upkeep", "Macros and help content kept current as you change."],
    ],
    proofH: "We run support on our own digital businesses with this exact team.",
    proofWhat: "support",
    faq2Q: "Do you work in our existing helpdesk?",
    faq2Peek: "Yes. We work in your stack and channels, not a separate system you have to learn.",
    faq2A: "Yes. The support operation runs inside your existing helpdesk, shared inbox, chat and social channels. You do not adopt a new tool or process to get support covered.",
    rel: [
      ["/hire/customer-support-specialist/", "Customer support specialist", "A single trained support operator, by the hour."],
      ["/hire/ecommerce-support-specialist/", "Ecommerce support specialist", "Support tuned to orders, returns and marketplaces."],
      ["/services/ai-automation/", "AI automation", "Where AI agents do the repetitive support, with review."],
    ],
  },
  {
    type: "service", slug: "digital-transformation",
    title: "Digital Transformation, Delivered as Operations | Back Office Factory",
    metaDesc: "Digital transformation delivered as operations: process digitisation, data migration and cleanup, tooling rollout and the ongoing run, by people and AI agents on one workflow.",
    ogTitle: "Digital transformation, delivered as operations",
    ogDesc: "Process digitisation, data migration and cleanup, tooling rollout and the ongoing run, by people and AI agents on one workflow, hired by the hour.",
    twDesc: "Process digitisation, data migration and the ongoing run by people and AI agents, hired by the hour.",
    svcName: "Digital transformation",
    svcType: "Process digitisation, data migration and cleanup, tooling rollout, ongoing operations",
    svcDesc: "Digital transformation delivered as operations: process digitisation, data migration and cleanup, tooling rollout support and the ongoing run, by real people and AI agents on one workflow, hired by the hour.",
    h1: "Digital transformation, delivered as operations.",
    heroSub: "Not a slide deck. We digitise the manual processes, migrate and clean the data, support the rollout and then run the new way of working, with people and AI agents on one workflow.",
    scopeEyebrow: "What digital transformation covers here",
    scopeH: "The change actually delivered and then run, not advised.",
    scopeDeck: "Transformation only counts when the new process runs every day. We do the doing.",
    scope: [
      ["Process digitisation", "Manual, paper and ad-hoc processes turned into clean workflows."],
      ["Data migration", "Records moved between systems cleanly and verified."],
      ["Data cleanup", "Legacy and messy data tidied into a usable state."],
      ["Tooling rollout support", "New tools rolled out and the operational change absorbed."],
      ["Workflow redesign", "Recurring work redesigned around people plus AI."],
      ["Ongoing run", "The new way of working operated day to day, by the hour."],
    ],
    proofH: "We ran this transformation on our own digital businesses first.",
    proofWhat: "operations",
    faq2Q: "Is this consulting, or do you do the work?",
    faq2Peek: "We do the work. We digitise, migrate, roll out and then run it day to day.",
    faq2A: "We do the work. This is not advisory: we digitise the processes, migrate and clean the data, support the rollout and then run the new operation day to day on one workflow. Strategy stays yours; delivery is ours.",
    rel: [
      ["/services/back-office-automation/", "Back-office automation", "Repetitive processes mapped, automated and run."],
      ["/services/ai-automation/", "AI automation", "AI agents on the repetitive work, people on judgement."],
      ["/hire/data-entry-specialist/", "Data entry specialist", "High-volume migration, cleanup and entry."],
    ],
  },
];

let count = 0;
for (const p of PAGES) {
  const base = p.type === "role" ? "hire" : "services";
  const path = `${base}/${p.slug}`;
  const src = `${base}-${p.slug}`;
  const crumbParent = p.type === "role" ? "Hire" : "Services";

  const html = TEMPLATE
    .replaceAll("{{TITLE}}", p.title)
    .replaceAll("{{META_DESC}}", p.metaDesc)
    .replaceAll("{{PATH}}", path)
    .replaceAll("{{SRC}}", src)
    .replaceAll("{{OG_TITLE}}", p.ogTitle)
    .replaceAll("{{OG_DESC}}", p.ogDesc)
    .replaceAll("{{TW_TITLE}}", p.title.split(" | ")[0])
    .replaceAll("{{TW_DESC}}", p.twDesc)
    .replaceAll("{{SVC_NAME}}", p.svcName)
    .replaceAll("{{SVC_TYPE}}", p.svcType)
    .replaceAll("{{SVC_DESC}}", p.svcDesc)
    .replaceAll("{{CRUMB_PARENT}}", crumbParent)
    .replaceAll("{{CRUMB_CURRENT}}", p.svcName)
    .replaceAll("{{PILL}}", p.type === "role" ? "Hire by the hour" : "Back-office services")
    .replaceAll("{{H1}}", p.h1)
    .replaceAll("{{HERO_SUB}}", p.heroSub)
    .replaceAll("{{SCOPE_EYEBROW}}", p.scopeEyebrow)
    .replaceAll("{{SCOPE_H}}", p.scopeH)
    .replaceAll("{{SCOPE_DECK}}", p.scopeDeck)
    .replaceAll("{{SCOPE_LIST}}", p.scope.map(([b, d]) => scope(b, d)).join("\n"))
    .replaceAll("{{PROOF_H}}", p.proofH)
    .replaceAll("{{PROOF_WHAT}}", p.proofWhat)
    .replaceAll("{{FAQ2_Q}}", p.faq2Q)
    .replaceAll("{{FAQ2_PEEK}}", p.faq2Peek)
    .replaceAll("{{FAQ2_A}}", p.faq2A)
    .replaceAll("{{REL_LIST}}", p.rel.map(([h, b, s]) => rel(h, b, s)).join("\n"));

  const outDir = join(ROOT, base, p.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  count++;
  console.log(`  ${path}/`);
}
console.log(`\nGenerated ${count} landing pages.`);
