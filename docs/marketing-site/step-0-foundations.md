# Step 0 — Marketing Foundations & SEO Config

This step establishes the Next.js framework project, style tokens, and the technical configurations required to guarantee optimal search engine indexing.

---

## 🎯 Objectives
* Initialize Next.js 16 with the App Router and Turbopack.
* Establish a Tailwind-based design system conforming to the Kalahari brand identity.
* Set up global page frameworks and component boundaries (Server vs. Client Components).
* Build the base SEO configurations (`sitemap.ts`, `robots.ts`, dynamic metadata).
* Configure automated Core Web Vitals checks.

---

## 🔨 Tasks & Sub-Tasks

### 1. Next.js & Tooling Setup
- [ ] Initialize the project: `npx -y create-next-app@latest kredo-marketing --ts --tailwind --app --src-dir --import-alias "@/*" --eslint` (ensure non-interactive flags).
- [ ] Configure `next.config.js` to enable Turbopack and optimization settings (e.g. image optimization domains).

### 2. Design System & Styling
- [ ] Update `tailwind.config.ts` with brand-specific tokens:
  * Primary brand colors (e.g. warm earth tones matching Kalahari's theme).
  * Professional typography sizes and line-heights.
- [ ] Setup `next/font` in `src/app/layout.tsx` to load modern web typography (e.g. *Outfit* or *Inter*) with swap behavior to eliminate layout shift.
- [ ] Define shared styles and CSS custom properties inside `src/app/globals.css`.

### 3. Base Layout & Components
- [ ] Create the outer layout framework (`layout.tsx`) containing:
  * **Header:** Navigation links (Home, How it Works, Pricing, Blog) + "Apply / Sign In" primary CTA link to `kredo.kalahari.co.za`.
  * **Footer:** Newsletter sign-up, sitemap columns, NCR registration disclosures, copyright notices, and legal links.
- [ ] Mark layout sub-components as React Server Components (RSC) by default. Use `"use client"` only for interaction elements like mobile menu toggles.

### 4. SEO & Metadata Scaffolding
- [ ] Create a central `src/config/seo.ts` file containing default metadata properties (OpenGraph, Twitter, Favicons, NCR numbers).
- [ ] Implement global metadata configuration in `layout.tsx`.
- [ ] Implement `src/app/robots.ts` using Next.js App Router metadata conventions.
- [ ] Implement `src/app/sitemap.ts` returning static routes.

### 5. Performance Monitoring (CI)
- [ ] Create `.lighthouserc.json` specifying performance thresholds:
  * Performance: 95+
  * SEO: 100
  * Accessibility: 95+
- [ ] Configure a local script or Github Action step using Lighthouse CI (`@lhci/cli`) to enforce these budgets on production preview builds.

---

## 🏛️ Code Structure Draft

### `robots.ts`
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: 'https://kalahari.co.za/sitemap.xml',
  };
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Lighthouse CI Check:** Run `npm run build` followed by a local Lighthouse analysis; verify that scores meet or exceed performance requirements.
* **Metadata Integrity Check:** Run a unit test verifying that default metadata yields a canonical URL matching the route path (no relative canonical links).
* **Bundle Analysis:** Run `next-bundle-analyzer` to verify that the initial JavaScript footprint sent to the browser is less than `80KB` gzip.

### Manual Verification
* Run the app locally, inspect the generated index page source (`View Source`), and confirm that the `<title>`, `<meta name="description">`, and `<link rel="canonical">` elements render correctly.
