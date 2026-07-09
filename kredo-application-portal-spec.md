# Kredo — Application Portal + Shared Platform Implementation Spec

> **Kredo** = the web app at `kredo.kalahari.co.za` where students actually apply for and manage credit. This doc covers (A) the **Angular portal** and (B) the **shared NestJS backend** both Kredo and the Kalahari marketing site consume.
> Priority for this app: **speed + stability**. It's behind auth, so no SSR/SEO — a lean client-rendered SPA with a fast shell and aggressive code-splitting.

---

# Part A — Application Portal (Angular)

## A1. Why Angular here
This is a long-lived, form-heavy, regulated funnel: onboarding, KYC, affordability, quote, e-sign, then account management. Angular's structure (DI, guards, typed forms) fits that better than a hand-assembled stack, and **Angular 22 is now zoneless + signal-based**, so the old "Angular is heavy at runtime" critique no longer holds. The remaining thing to manage is **initial bundle size** — handled below. Bonus: it reinforces the Angular skillset you're marketing to employers.

## A2. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Angular 22** (standalone components, **zoneless**, signals) | Structured + stable for a regulated funnel; zoneless/signals = fast runtime. |
| Rendering | **CSR SPA** (no SSR) | Behind auth; SEO irrelevant; CSR keeps it simple and lean. |
| Forms | **Signal Forms** (stable in v22) for the multi-step wizard | Low boilerplate, reactive validation — ideal for KYC/affordability/quote. |
| UI | **Angular CDK + Tailwind** (lean), *not* full Angular Material | Keep the bundle small; use CDK primitives + your own styled components. |
| State | **Signals** + **NgRx SignalStore** only where shared state grows | Minimal, fast, no Redux ceremony. |
| Routing | Angular Router, **lazy-loaded standalone routes** + `@defer` | Code-split per feature; defer below-the-fold/heavy bits. |
| HTTP | `HttpClient` + interceptors (auth, retry, error mapping) | Typed client generated from the backend OpenAPI (`ng-openapi-gen`). |
| Auth | **OIDC** via `angular-auth-oidc-client` (Supabase Auth / Auth0) | Token in memory + refresh; route guards; step-up on sensitive actions. |
| Step-up / login | **WebAuthn / passkeys** where available, else re-auth | Strong, low-friction verification for signing + bank-detail changes. |
| KYC capture | Web KYC SDK (`getUserMedia` + provider widget) | ID capture + selfie **liveness** in-browser. |
| e-sign | In-browser PDF view + signature capture | NCA agreement + pre-agreement quote. |
| Perf tooling | **Bundle budgets** in `angular.json` + `source-map-explorer` in CI | Enforce "light and fast" — fail the build if it regresses. |
| Testing | **Vitest** (Angular 22 default) + Playwright E2E | Unit + the money/application happy paths. |

## A3. Performance guardrails (the "fast" in "light and fast")
- **Lazy-load every feature route**; the initial shell is auth + layout only.
- **`@defer`** heavy/below-fold blocks (charts, document viewer, KYC widget) so they don't bloat first load.
- **Route-level preloading** for the *likely-next* step of the funnel (predictive, not everything).
- **CI bundle budget**: hard `error` threshold on initial bundle; track it per PR.
- **OnPush everywhere** (default under zoneless) + signals for fine-grained updates.
- **No heavyweight UI kit**; import only the CDK behaviours you use.
- Skeleton loaders + optimistic UI on the funnel so it *feels* instant on SA mobile networks.

## A4. App structure
```
src/app/
  core/            # auth, http interceptors, guards, money (ZAR cents), config
  shared/          # design-system components, pipes, validators
  features/
    onboarding/    # register, verify, POPIA consent  (lazy)
    kyc/           # ID capture, liveness, student verification  (lazy)
    application/   # affordability → quote → agreement e-sign wizard  (lazy)
    dashboard/     # facility, limit, status  (lazy)
    wallet/        # vouchers active/redeemed  (lazy)
    drawdown/      # request voucher against facility  (lazy)
    repayments/    # schedule, pay-now, history  (lazy)
    progress/      # credit-building tracker  (lazy)
    profile/       # details, consents, data requests, support  (lazy)
```

## A5. Core journeys
1. **Land from CTA** — arrives at `/apply?ref=…&utm_…`; capture attribution before anything else.
2. **Register & consent** — email/phone → OTP → granular **POPIA consent** (processing, credit-bureau enquiry+reporting, marketing), timestamped audit trail. No consent → no processing.
3. **KYC / FICA** — capture SA ID (or smart-ID/passport) + **selfie liveness**; verify against Home Affairs/bureau; verify **student status** (institution email, NSFAS/bursary ref, or student card). Statuses `pending → verified → failed → manual_review`.
4. **Subscribe** — choose plan → set up **DebiCheck** authenticated debit-order mandate → subscription `active`.
5. **Apply (the wizard)** — **affordability assessment** (NCA s81) → **pre-agreement statement & quote** (mandatory, plain language) → **e-sign the credit agreement** → facility limit assigned. Built on Signal Forms.
6. **Draw down** — pick partner retailer + amount within limit → facility drawn → **closed-loop voucher** issued (code/QR + expiry).
7. **Repay** — DebiCheck scheduled collection, or **pay-now** (card/instant EFT). Ledger updated; on-time behaviour recorded.
8. **Build credit** — monthly, behaviour is **reported to bureaus**; progress tab shows history accumulating. Honest copy: *you report behaviour; bureaus/score models decide the score.*
9. **Arrears (must be humane)** — reminders → grace → NCA-compliant collections + Section 129 where it escalates. If collections feel like the loan sharks you're replacing, the brand dies. Design this with as much care as onboarding.

## A6. Portal non-negotiables
- Fee/limit numbers come **only** from the backend quote/agreement — never computed client-side.
- Integer cents everywhere; format `R1 234,56`.
- **Step-up auth** (passkey/re-auth) before viewing full ID, changing bank details, signing, or a large drawdown.
- Every data screen has loading/empty/error states; works on a cheap Android on 3G.

---

# Part B — Shared Platform (Backend)

> Consumed by both Kredo and the Kalahari marketing site (the latter only hits `leads`).

## B1. Stack

| Concern | Choice | Why |
|---|---|---|
| Runtime + framework | **NestJS (Node 20 LTS + TypeScript)** | Modules/DI/guards give a regulated, integration-heavy backend real structure; same stack as your other projects. |
| Architecture | Feature modules + a pure `domain` layer of use-cases + `infra` adapters | NCA rules live in the domain, not controllers. |
| DB | **PostgreSQL** (managed, POPIA-appropriate region — AWS `af-south-1` Cape Town or Azure SA North). Supabase OK for MVP **if** its region/terms pass your POPIA check. | Transactional integrity for a double-entry ledger. |
| ORM | **Prisma** (interactive transactions for ledger postings) + raw SQL for statements/reporting | Type-safety + control where money math needs it. |
| Async/jobs | **BullMQ (Redis)** + `@nestjs/schedule` | KYC, voucher issuance, reconciliation, bureau batch, billing, arrears sweeps. |
| Auth | Managed OIDC (**Supabase Auth**/**Auth0**) for MVP; architected to move to self-hosted (**Keycloak/Ory**) as the licence-holder. NestJS guards validate JWTs + scopes. | Offload MFA now; keep an exit ramp. |
| CORS/session | Allow origins `kalahari.co.za` + `kredo.kalahari.co.za`; API on `api.kalahari.co.za` | Two web origins, one API. |
| Payments | DebiCheck (bank/BankservAfrica-accredited provider) + PSP (Ozow/Stitch/Peach/Yoco) | Mandates + pay-now. |
| Vouchers | Closed-loop issuer / retailer gift-card APIs (Blu, 1ForYou, or direct retailer) | The credit product's "spend" leg. |
| Bureau reporting | TransUnion / Experian / XDS / Compuscore feeds | **This is the value prop** — building formal history. |
| Docs (PDF) | **pdfmake** or HTML→PDF via **Puppeteer** (you know Puppeteer) | Agreements, quotes, statements. |
| Secrets | Real secrets manager (Doppler / AWS Secrets Manager / cloud KMS) | ID numbers, keys, mandates — never `.env` in prod. |
| Observability | **OpenTelemetry + Sentry + structured logs (no PII)** | Audit + ops. |

## B2. Domain model (core entities)
- **Consumer** — the student. PII (ID number, contact) **encrypted at rest**. KYC + student-verification status.
- **Consent** — one row per consent type/version, timestamp, source, device/IP, `granted|withdrawn`. Append-only audit.
- **Institution** — university/TVET/private; student verification + segmentation.
- **Subscription** — plan, status, billing cycle, mandate reference.
- **Mandate** — DebiCheck authenticated debit-order mandate; status lifecycle.
- **AffordabilityAssessment** — income, expenses, existing obligations, disposable income, outcome (NCA s81).
- **CreditAgreement** — the NCA agreement: linked quote, signed-doc reference, fee-schedule snapshot, principal/limit, status.
- **CreditFacility** — revolving limit, available vs. utilised, drawn against by vouchers.
- **Voucher** — value, retailer, code/QR, expiry, `issued|redeemed|expired|cancelled`.
- **LedgerAccount / LedgerEntry** — **double-entry** ledger (B3). Source of truth for all money.
- **Repayment** — scheduled + actual; method; links to ledger entries.
- **BureauSubmission** — what was reported, when, for whom, in which layout; ack/response.
- **Merchant/Retailer** — closed-loop partners, discount terms (B2B revenue line).
- **CaseFile** — arrears/collections/complaints workflow with Section 129 tracking.

## B3. The ledger (do this properly — it's the spine)
Model money as a **double-entry ledger**, not mutable balance columns.
- Accounts: `ConsumerReceivable`, `VoucherLiability`, `CashClearing`, `FeeIncome`, `InterestIncome`, `SubscriptionIncome`, `Impairment/Provision`, `BadDebt`.
- Every event posts a **balanced transaction** (Σdebits = Σcredits), immutable, append-only, with an idempotency key.
  - Drawdown → Dr `ConsumerReceivable`, Cr `VoucherLiability`.
  - Voucher settled to retailer → Dr `VoucherLiability`, Cr `CashClearing`.
  - Repayment received → Dr `CashClearing`, Cr `ConsumerReceivable`.
  - Fee/interest accrual → Dr `ConsumerReceivable`, Cr `FeeIncome`/`InterestIncome` (within NCA caps).
  - Impairment → Dr `Impairment`, Cr `Provision` (model this from day one — see B4.1).
- Balances are **derived** (sum of entries), never stored-and-edited.
- Amounts stored as **integer cents** (`BIGINT`); use `Prisma.Decimal`/`decimal.js` for rate math — **never JS `number` floats** (`0.1 + 0.2` will bite a ledger). Make it a lint rule.

## B4. Compliance engine (first-class, enforced in the domain)
1. **You hold the licence.** You're registering as the **NCR credit provider** yourself (Form 2; director criminal clearances; SARS + banking proof; fees). That means: (a) store + surface the NCR number on agreements/statements/site; (b) **annual renewal by 31 July**; (c) **statutory NCR returns** — generate them from the ledger, don't hand-build; (d) you carry the credit risk → a **provisioning/bad-debt policy** modelled in the ledger (impairment, ageing) *before* your first defaults; (e) cooperate with debt-review. Gate go-live behind holding registration (or a valid s89(4) pending-application position).
2. **Affordability assessment** — enforced before any facility; outcome persisted; reject/limit if unaffordable; no override without logged manual review.
3. **Pre-agreement quote + agreement** — generated, versioned, e-signed, retained. Fee schedule **snapshotted** onto the agreement.
4. **Fee/rate caps** — NCA caps initiation fee, monthly service fee, interest by credit type. Encode current maxima as **dated, configurable rules** and validate every agreement; do **not** scatter today's numbers as constants.
5. **POPIA** — PII encryption, purpose-bound processing, consent audit, data-subject access/deletion workflows, breach hooks, named Information Officer, retention schedules.
6. **FICA/KYC** — verified identity + record-keeping before transacting.
7. **Bureau reporting** — accurate, timely, **disputable** (build the correction flow).
8. **Collections** — NCA-compliant, Section 129 where applicable, no harassment, auditable.

> Treat B4 as acceptance criteria the domain enforces, not a checklist a human remembers. Confirm exact current thresholds, fee maxima, capital expectations, and agreement wording with an NCR-experienced attorney before launch; encode them as data, not literals.

## B5. Integrations (each behind an interface + queued via outbox)
Identity/KYC (SA ID + liveness) · Student verification · DebiCheck + PSP (mandates, collections, pay-now, webhooks→ledger) · Voucher issuer/retailers · Credit bureaus (monthly submission + onboarding enquiry + dispute channel) · Notifications (email/SMS + optional Web Push).
All external calls: interface + adapter, retry w/ backoff, circuit breaker, **queued event (BullMQ) written via a transactional outbox** so ledger/state updates are atomic and replayable. Every write path carries an **idempotency key** (money must never double-post).

## B6. API surface (illustrative, `/api/v1`)
`auth/*` (identity provider; guards validate) · `leads` (public, rate-limited — marketing) · `referrals` · `consumers/me`, `.../consents`, `.../data-requests` · `kyc/session`, `kyc/status` · `subscriptions`, `.../mandate` · `affordability`, `facilities`, `.../agreement`, `.../quote` · `drawdowns`, `vouchers`, `vouchers/{id}` · `repayments`, `.../pay-now`, `.../schedule` · `ledger/entries` (read) · `statements`, `.../pdf` · `credit-progress` · `webhooks/{psp|debicheck|voucher|bureau}` (signed).
Publish **OpenAPI**; the Angular portal and the Next.js site generate their clients from it.

## B7. Non-functionals
- **Security**: least-privilege, secrets manager, PII encryption at rest, signed webhooks, full audit log of every money/consent/agreement action, WAF.
- **Reliability**: idempotent money ops, outbox pattern, dead-letter queues, daily reconciliation (ledger vs. PSP/voucher issuer).
- **Data residency**: PII in a POPIA-appropriate region.
- **Testing**: domain unit tests (ledger balancing, affordability, fee caps), integration tests vs. PSP/bureau sandboxes, contract tests on webhooks.

---

# Part C — Shared build plan (phased)

**Phase 0 — Foundation & legal (parallel, Weeks 1–2)**
Start **NCR registration** now (long pole). Backend skeleton (NestJS, Postgres+Prisma, Redis/BullMQ, auth, CORS for both origins, CI/CD, OpenAPI), ledger core with tests, secrets manager, observability. Angular shell (auth + layout + bundle budget).

**Phase 1 — Identity & onboarding (Weeks 3–4)**
Consumer + consent + KYC + student verification. Kredo onboarding + POPIA consent. (Marketing waitlist already live from the Kalahari spec.)

**Phase 2 — Money rails (Weeks 5–7)**
Subscription + DebiCheck mandate, PSP pay-now, ledger postings, reconciliation. Kredo subscription flow + read-only dashboard.

**Phase 3 — Credit core (Weeks 8–10)**
Affordability engine, quote + agreement (PDF + e-sign, Signal Forms wizard), facility, drawdown → voucher issuance + redemption reconciliation.

**Phase 4 — The value prop (Weeks 11–12)**
Bureau submission + enquiry + dispute flow. Credit-progress tracker. Statements (PDF).

**Phase 5 — Care & scale (Week 13+)**
Humane arrears/collections + Section 129, complaints/ombud flow, retailer B2B onboarding + discount reconciliation, analytics maturity.

---

# Part D — Immediate next steps (before code)
1. **Complete NCR registration** with an NCR attorney — confirm documents, fees, **capital/solvency expectations**, and statutory-returns cadence. Long lead item; everything money-moving is gated behind it.
2. **Confirm current NCA fee maxima + agreement wording** → encode as dated config.
3. **Pick the voucher issuer / anchor retailers** — the closed-loop economics (B2B discount) drive your margin and risk.
4. **Confirm bureau reporting layout + onboarding** with ≥1 bureau — no reporting, no product.
5. **Model unit economics** — as the licence-holder you fund the book and eat defaults; make sure subscription + capped fees clear a positive margin at a realistic default rate *before* committing tiers.
