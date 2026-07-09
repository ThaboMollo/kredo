# 📣 Kalahari Marketing Site — Track Index

The Kalahari marketing site is a fast, highly optimized **Next.js 16** application focusing on SEO, branding, education, and lead conversion. It serves as the top-of-funnel gateway for prospective students.

---

## 🛠️ Tech Stack Recap
* **Framework:** Next.js 16 (App Router, Turbopack bundler)
* **Styling:** Tailwind CSS
* **Content:** Local MDX files (or a headless CMS like Sanity/Contentful)
* **Hosting:** Vercel

---

## 📂 Implementation Steps

Click on any step below to see its detailed step-by-step implementation plan:

1. **[Step 0: Marketing Foundations & SEO Config](file:///Users/mollomponya/Documents/Dev/kredo/docs/marketing-site/step-0-foundations.md)**
   * Bootstrap Next.js 16, set up Tailwind CSS configuration, implement the core layout templates, configure sitemaps/robots APIs, and configure Lighthouse CI performance metrics.
2. **[Step 1: Acquisition MVP (Go-Live)](file:///Users/mollomponya/Documents/Dev/kredo/docs/marketing-site/step-1-acquisition-mvp.md)**
   * Build the core structural pages: Home, How It Works, Pricing, Trust & Compliance, and Legal. Set up the waitlist/lead capture widget and first-party UTM cookie tracking.
3. **[Step 2: Blog & Content Engine](file:///Users/mollomponya/Documents/Dev/kredo/docs/marketing-site/step-2-content-engine.md)**
   * Build the static content publishing engine for financial literacy ("Money 101"), tag categorization, internal linking layouts, and dynamic sitemaps.
4. **[Step 3: Growth, Ambassadors & Tracking](file:///Users/mollomponya/Documents/Dev/kredo/docs/marketing-site/step-3-growth.md)**
   * Create ambassador registration funnels, set up referral URL parsing, integrate consent-gated privacy-friendly analytics, and build A/B conversion tests.

---

## 🚀 Key Performance Budgets (Core Web Vitals)
To maintain search engine authority and user experience, the marketing site enforces these performance budgets in CI:
* **Largest Contentful Paint (LCP):** < 2.5 seconds (mobile over 3G).
* **Interaction to Next Paint (INP):** < 200 milliseconds.
* **Cumulative Layout Shift (CLS):** < 0.1.
* **JS Weight:** Minimize client components to ensure raw HTML is served for indexing.
