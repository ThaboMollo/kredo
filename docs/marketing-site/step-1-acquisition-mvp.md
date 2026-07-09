# Step 1 — Acquisition MVP (Go-Live)

This step builds the primary acquisition pages, waitlist widgets, POPIA consent checkmarks, and the referral/UTM attribution cookie synchronization mechanism.

---

## 🎯 Objectives
* Build the static core pages: Home, How It Works, Pricing, Trust & Compliance, and Legal.
* Create the Lead Capture/Waitlist Form with explicit POPIA consents.
* Integrate URL parameter parsing (`ref` / `utm_*`) to write first-party tracking cookies.
* Append attribution cookies dynamically to Kredo CTA out-links.
* Inject schema-correct JSON-LD structured data.

---

## 🔨 Tasks & Sub-Tasks

### 1. Static Pages Development (RSC)
- [ ] **Home Page (`page.tsx`):**
  * Hero section emphasizing student credit struggles.
  * Three-step graphic demonstrating subscription -> voucher -> credit history.
  * Primary CTAs pointing to Kredo onboarding.
- [ ] **How It Works Page (`how-it-works/page.tsx`):**
  * Visual timeline detailing closed-loop retail voucher spend.
  * FAQ accordion module populated with question data.
- [ ] **Pricing Page (`pricing/page.tsx`):**
  * Clean, transparent price comparison table outlining subscription levels.
- [ ] **Trust & Compliance (`trust/page.tsx`):**
  * Legal information regarding NCR registration, complaints escalation, and POPIA guidelines.
- [ ] **Legal Documents (`legal/page.tsx`):**
  * Standard Terms, PAIA Manual, and Privacy Policy texts.

### 2. Lead Capture & Waitlist Widget (Client Island)
- [ ] Create a React Client Component `WaitlistForm.tsx`.
- [ ] Add fields: Full Name, Email, Mobile, University.
- [ ] Add explicit, unchecked checkboxes for POPIA consent:
  * Checkbox A: Consent to data processing for credit evaluation.
  * Checkbox B: Consent to marketing outreach.
- [ ] Submit form data asynchronously via a Next.js Server Action or Fetch request to the backend `POST api.kalahari.co.za/v1/leads`.
- [ ] Add rate-limiting hooks or integrate bot prevention (e.g. Turnstile or hCaptcha).

### 3. Referral & UTM Handoff Engine
- [ ] Implement a client utility script `src/utils/attribution.ts` that runs in the root layout:
  * Checks current URL query parameters for `ref`, `utm_source`, `utm_medium`, `utm_campaign`.
  * If consent has not been granted, keeps attribution in the current URL/session only and passes it through CTA links without durable storage.
  * If consent has been granted, stores a minimal signed first-party cookie `kalahari_ref` expiring in 30 days. Do not call this "encrypted" unless the value is genuinely protected from client inspection; JavaScript-readable cookies are attribution hints, not secrets.
- [ ] Create a CTA URL helper for all out-links:
  * Reads attribution from the current URL first, then from the consented cookie if present.
  * Appends the values as query strings when rendering the link, e.g.:
    `href="https://kredo.kalahari.co.za/apply?ref=AMB&utm_source=tiktok"`
  * Prefer a Server Component link when attribution is available in the request URL; use a small client component only when reading a consented browser cookie is required.

### 4. Structured Data (JSON-LD) Integration
- [ ] Inject JSON-LD scripts dynamically on target routes:
  * **Home / Trust:** `Organization` and `FinancialService` schemas.
  * **How It Works:** `FAQPage` schema mapping the accordion questions.
  * **Blog Articles (prepared):** `Article` schema.

---

## 🏛️ Code Structure Draft (PortalCTA)

```tsx
type Attribution = Partial<Record<'ref' | 'utm_source' | 'utm_medium' | 'utm_campaign', string>>;

export function buildPortalApplyUrl(attribution: Attribution = {}) {
  const url = new URL('https://kredo.kalahari.co.za/apply');

  for (const [key, value] of Object.entries(attribution)) {
    if (value) url.searchParams.set(key, value);
  }

  return url.toString();
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Attribution Handoff Test:** Request a page with `?ref=TEST1&utm_source=testsrc`, verify that CTA links include those parameters without requiring a cookie.
* **Consent Storage Test:** Verify that attribution cookies are not written before consent and are written only after explicit consent.
* **Form Consent Validation Test:** Attempt to submit the waitlist form with the processing consent unchecked; assert that validation stops the submission and displays an error message.
* **JSON-LD Schema Verification:** Test that pages contain valid `<script type="application/ld+json">` payloads that compile without syntax errors.

### Manual Verification
* Access the site with UTM query parameters in the URL, click "Apply Now," and confirm that the browser is redirected to the correct destination URL with the matching UTM parameters appended.
