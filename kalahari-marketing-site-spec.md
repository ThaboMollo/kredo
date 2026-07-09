# Kalahari — Marketing Site Implementation Spec (Next.js)

> Working names: **Kalahari** = the company/brand site (`kalahari.co.za`). **Kredo** = the application portal (`kredo.kalahari.co.za`), speced separately. Swap globally if branding changes.
> **This site's job:** rank on Google, explain the business and how it works, build trust with a credit-anxious audience, capture leads, and hand qualified intent off to the Kredo portal via a CTA. **No login lives here.**

---

## 1. Priority: SEO first
Every decision below is filtered through "does this help us get found and trusted." Concretely that means server-rendered/static HTML, fast Core Web Vitals, clean semantic markup, and a content engine — not a heavy client-side app.

---

## 2. Stack & rationale

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Best-in-class SEO for React: React Server Components, static generation + ISR, streaming, first-class metadata/sitemap APIs. Turbopack is the default bundler. |
| Rendering | **SSG + ISR**, mostly Server Components | Ship HTML, not a JS app. Marketing pages are static; blog uses ISR so content updates without a full redeploy. |
| Styling | **Tailwind CSS** + a small design-system layer | Fast, consistent, minimal CSS shipped. |
| Content | **MDX** or a headless CMS (Sanity/Contentful) for the blog | Non-devs can publish "Money 101" content; MDX if you want it in-repo and free. |
| Forms | Small **client island** + Server Action / API call to the backend `leads` endpoint | Keep JS tiny; only the waitlist/lead widget is interactive. |
| Analytics | **Plausible** or **PostHog** (privacy-friendly, consent-gated) | POPIA-friendly; no cookie-wall drag on Core Web Vitals. |
| Fonts/images | `next/font`, `next/image` | Zero layout shift, optimised images — direct CWV wins. |
| Hosting | **Vercel** (natural fit) or self-hosted Node 20+ | Data residency is low-stakes here (only lead email/phone) — still POPIA-consent the form. |
| i18n | App Router i18n + `hreflang` ready | EN first; structure for isiZulu/Sesotho/Afrikaans later. |

---

## 3. SEO implementation checklist (build these in from day one)
- **Metadata** via the `generateMetadata` API per route: title, description, canonical, OpenGraph + Twitter cards.
- **Structured data (JSON-LD)**: `Organization` + `FinancialService` (with NCR registration number once held), `FAQPage` on how-it-works, `BreadcrumbList`, `Article` on blog posts.
- **`sitemap.ts`** and **`robots.ts`** (App Router file conventions) — dynamic sitemap that includes blog posts.
- **Semantic HTML + heading hierarchy** (one `h1`/page, logical `h2`/`h3`). Screen-reader-correct = crawler-correct.
- **Core Web Vitals budget**: LCP < 2.5s, INP < 200ms, CLS < 0.1 on a mid-range Android over 3G. Enforce with Lighthouse CI in the pipeline.
- **Minimal client JS**: default to Server Components; only the lead form + nav toggle are client components.
- **Clean URLs**: `/how-it-works`, `/pricing`, `/blog/build-credit-as-a-student` — keyword-relevant, stable, no query-string routing for content.
- **Internal linking**: blog → how-it-works → CTA, so link equity flows toward conversion pages.
- **Page speed**: static where possible, CDN-cached, `next/image` for everything, no render-blocking third-party scripts.

---

## 4. Pages (public, all crawlable)
- **Home** — the problem (students trapped by predatory micro-lenders), the Kalahari promise (subscription → build a real credit history before you graduate), how it works in 3 steps, trust signals, primary CTA → Kredo.
- **How it works** — subscription → facility → voucher drawdown at partner retailers → on-time repayment → **reported to credit bureaus** → history grows. FAQ block (JSON-LD `FAQPage`).
- **Pricing** — transparent, plain-language subscription tiers + fee table. Transparency is your differentiator vs. loan sharks; make this page a conversion asset, not fine print.
- **Trust & compliance** — NCR registration number, how POPIA data is handled, responsible-lending stance, complaints + NCR/Credit Ombud escalation path. Converts a nervous audience.
- **For campus partners** — SRCs, student accommodation, retailer sign-up (lead form).
- **Ambassadors** — apply to be a brand ambassador; referral mechanics.
- **Blog / Money 101** — the SEO engine: financial-literacy content targeting student-credit search terms. Ties directly to your LinkedIn content pillars.
- **Legal** — Terms, Privacy (POPIA), PAIA manual, cookie policy.

---

## 5. Lead capture & handoff to Kredo
- **Waitlist / lead form** posts to the backend `leads` endpoint. Captures explicit, granular **POPIA consent** (marketing vs. processing) with a timestamped, auditable record. Double opt-in on email.
- **Referral / UTM attribution**: ambassador links carry a code (`?ref=CODE`); persist it (consented first-party cookie) and **pass it through the CTA** to the portal (`kredo.kalahari.co.za/apply?ref=CODE&utm_...`) so the portal can attribute the eventual signup/activation back to the ambassador.
- **The CTA is a plain link to the portal** — no shared auth/session needed, because the marketing site has no login. Returning users click "Apply / Sign in" and land in Kredo.
- Rate-limit and bot-protect the lead endpoint (it will get spammed).

---

## 6. Cross-cutting
- **Accessibility**: WCAG 2.1 AA — also an SEO signal, and your audience is on small/cheap screens.
- **Consent management**: analytics/marketing pixels fire **only** after consent; keep the consent banner light so it doesn't tank CWV.
- **Security**: strict CSP, no secrets in the client, signed/verified lead submissions, rate limiting.
- **Content ops**: a simple editorial workflow so financial-literacy posts ship weekly without a developer.

---

## 7. Build plan (phased)

**Phase 0 — Foundations (Week 1)**
Next.js 16 + Tailwind + design-system primitives, metadata/sitemap/robots scaffolding, Lighthouse CI + CWV budget, analytics + consent scaffolding, backend `leads` endpoint contract agreed.

**Phase 1 — Acquisition MVP (Weeks 2–3)** — *ship first*
Home, How it works, Pricing, Trust & compliance, Legal. Waitlist capture + POPIA consent + referral attribution + CTA handoff to Kredo. JSON-LD + OG on every page. **This can go live and collect demand while Kredo and the backend are still being built** (and while NCR registration is in progress).

**Phase 2 — Content engine (Weeks 4–5)**
Blog/Money-101 (MDX or CMS), category/tag pages, dynamic sitemap, internal-linking pass, first batch of keyword-targeted articles.

**Phase 3 — Growth (Week 6+)**
Ambassador + campus-partner funnels, A/B testing on hero/CTA, structured-data expansion, i18n groundwork.

---

## 8. Definition of done (per page)
- Renders as static/streamed HTML with correct metadata + canonical + JSON-LD.
- Passes the CWV budget on a throttled mobile profile in Lighthouse CI.
- Any interactive bit is an isolated client island; the rest ships zero JS.
- Consent respected before any marketing/analytics script loads.
