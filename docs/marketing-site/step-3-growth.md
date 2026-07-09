# Step 3 — Growth & Referral Loops

This step implements the expansion funnels (Ambassadors and Campus Partners), consent-gated tracking integrations, conversion optimization frameworks, and localization preparation.

---

## 🎯 Objectives
* Build the Ambassador and Campus Partner landing pages and lead forms.
* Integrate Plausible / PostHog analytics behind a lightweight consent banner.
* Establish A/B testing infrastructure on conversion CTAs.
* Configure i18n structures for multi-language translation (EN, isiZulu, Sesotho, Afrikaans).

---

## 🔨 Tasks & Sub-Tasks

### 1. Expansion Landing Pages
- [ ] **Ambassadors Page (`ambassadors/page.tsx`):**
  * Landing page explaining the ambassador system (payout per activated invite).
  * Application form posting candidate details to the backend `/api/v1/ambassadors/apply` route.
- [ ] **Campus Partners Page (`campus-partners/page.tsx`):**
  * Informational landing page targeting university administrators and student accommodation companies.
  * Integration partner contact form.

### 2. Privacy-Friendly Consent Management (CWV Focus)
- [ ] Create a lightweight client component `ConsentBanner.tsx`:
  * Renders a non-obtrusive, accessible banner.
  * Respects Core Web Vitals (uses zero layout shift and loads only after page interaction).
- [ ] Implement analytics hook:
  * Only initialize PostHog or Plausible scripts if the user clicks "Accept."
  * Persist the consent setting in `localStorage` or a first-party cookie.

### 3. A/B Testing Infrastructure
- [ ] Choose a lightweight, server-side or edge-routing testing setup (e.g. Vercel Config or PostHog Feature Flags) to prevent page flickering/CLS.
- [ ] Define experiment variations:
  * Control vs. Variant A (A different CTA copy).
- [ ] Record conversion clicks to evaluate performance.

### 4. Internationalization Prep (i18n)
- [ ] Setup next-intl or built-in Next.js middleware localization structures:
  * Create `[locale]/` dynamic path groupings.
  * Move hardcoded texts to JSON translation asset keys (`en.json`, `zu.json`, `st.json`, `af.json`).
  * Ensure translation routing appends the appropriate `hreflang` link headers for crawlers.

---

## 🏛️ Code Structure Draft (`ConsentBanner.tsx`)

```tsx
"use client";

import { useState, useEffect } from 'react';

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie_consent');
    if (!hasConsented) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShow(false);
    // Initialize analytics library here
    if (window.posthog) window.posthog.opt_in_capturing();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg p-4 border rounded max-w-sm z-50">
      <p className="text-sm text-gray-700">
        We use privacy-friendly analytics to improve our pages. Accept?
      </p>
      <div className="mt-2 flex gap-2">
        <button onClick={handleAccept} className="bg-blue-600 text-white px-3 py-1 text-xs rounded">
          Accept
        </button>
        <button onClick={() => setShow(false)} className="text-gray-500 text-xs">
          Decline
        </button>
      </div>
    </div>
  );
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Consent Gating Validation Test:** Assert that prior to clicking "Accept," the analytics library initialization status remains inactive/undefined.
* **Localization Routing Test:** Attempt to load `/zu/pricing` and verify that the page renders the text matching the Zulu translation file schema.
* **CLS Experiment Test:** Run a Lighthouse check during an active A/B test split to verify that variant redirects do not cause cumulative layout shifts.

### Manual Verification
* Access the site, accept the cookie terms, refresh, and inspect the browser storage values to verify the consent preference is correctly saved.
