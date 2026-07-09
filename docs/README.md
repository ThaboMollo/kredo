# Kalahari & Kredo — Implementation Master Plan

Welcome to the implementation master plan for the **Kalahari Marketing Site**, the **Kredo Application Portal**, and the **Shared Platform Backend API**. This documentation provides a step-by-step roadmap for building and deploying all three systems.

---

## 📂 Documentation Directory Structure

Click on any of the links below to drill down into the specific tracks and steps of the implementation.

```text
docs/
├── README.md (You are here)
├── backend/
│   ├── README.md
│   ├── step-0-foundations.md
│   ├── step-1-onboarding.md
│   ├── step-2-money-rails.md
│   ├── step-3-credit-core.md
│   ├── step-4-bureau-reporting.md
│   └── step-5-arrears-and-scale.md
├── marketing-site/
│   ├── README.md
│   ├── step-0-foundations.md
│   ├── step-1-acquisition-mvp.md
│   ├── step-2-content-engine.md
│   └── step-3-growth.md
└── app-portal/
    ├── README.md
    ├── step-0-foundations.md
    ├── step-1-onboarding.md
    ├── step-2-money-rails.md
    ├── step-3-credit-wizard.md
    ├── step-4-drawdown-vouchers.md
    └── step-5-arrears-and-profile.md
```

---

## 🗺️ Project Tracks Overview

### 1. 🧰 [Shared Platform Backend API](file:///Users/mollomponya/Documents/Dev/kredo/docs/backend/README.md)
* **Stack:** NestJS, PostgreSQL (Prisma ORM), BullMQ (Redis)
* **Goal:** A highly structured, compliant, and transactionally secure backend to handle double-entry ledger bookkeeping, National Credit Act (NCA) compliance, KYC (FICA) verifications, debit order mandates, and credit bureau submissions.
* **API Domain:** `api.kalahari.co.za` (CORS-enabled for the marketing site and application portal).

### 2. 📣 [Kalahari Marketing Site](file:///Users/mollomponya/Documents/Dev/kredo/docs/marketing-site/README.md)
* **Stack:** Next.js 16 (App Router, SSG/ISR), Tailwind CSS, MDX
* **Goal:** Rank on search engines (SEO-first), educate users on credit-building, and capture lead/waitlist data.
* **Domain:** `kalahari.co.za` (no user authentication/login lives here).

### 3. 🛡️ [Kredo Application Portal](file:///Users/mollomponya/Documents/Dev/kredo/docs/app-portal/README.md)
* **Stack:** Angular 22 (Standalone, Zoneless, Signals), Angular CDK, Tailwind CSS
* **Goal:** A fast, client-side application (CSR SPA) for the regulated onboarding, KYC, quote, e-signing, and voucher management flows.
* **Domain:** `kredo.kalahari.co.za` (protected by OIDC authentication).

---

## ⚡ Integration & Build Timeline

The projects are designed to be built in parallel. Below is how the steps across the three projects align.

> **Feasibility note:** this is an engineering timeline for a sandbox or controlled pilot. Production launch of the credit product is gated by external readiness: NCR registration/legal sign-off, bureau onboarding and accepted test files, DebiCheck/PSP contracts, voucher issuer or retailer contracts, KYC/FICA provider onboarding, operational review workflows, and an approved provisioning/unit-economics model.

### Phase -1: Legal & Partner Readiness Gate
Before any money-moving production launch, complete and document:
* NCR credit-provider registration status, attorney-reviewed NCA agreement wording, current fee/rate caps, statutory returns cadence, and Section 129 process.
* POPIA operating model: Information Officer, PAIA/Privacy notices, consent text versions, DSAR workflow, breach process, retention policy, and cross-border/provider processing checks.
* Signed or sandbox-approved integrations for KYC/FICA, DebiCheck, PSP pay-now, voucher issuance/retailer settlement, notifications, and at least one credit bureau.
* Finance sign-off on voucher settlement, merchant discounts, impairment/provisioning, write-off policy, and unit economics at realistic default rates.
* Operations tooling for manual KYC review, document review, reconciliation discrepancies, bureau disputes, complaints, arrears cases, and support escalations.

```mermaid
gantt
    title Integrated Project Timeline (13+ Weeks)
    dateFormat  X
    axisFormat %d

    section Shared Backend API
    Step 0: Foundations & Ledger Core   :active, b0, 0, 14
    Step 1: Onboarding & KYC API        :b1, 14, 28
    Step 2: Money Rails & DebiCheck     :b2, 28, 49
    Step 3: Credit Core & Vouchers      :b3, 49, 70
    Step 4: Bureau Reporting & PDFs     :b4, 70, 84
    Step 5: Care, Arrears & Scale       :b5, 84, 98

    section Kalahari Marketing Site
    Step 0: Marketing Foundations       :m0, 0, 7
    Step 1: Acquisition MVP (Go-Live)   :m1, 7, 21
    Step 2: Blog & Content Engine       :m2, 21, 35
    Step 3: Growth & Referral Loops     :m3, 35, 49

    section Kredo Portal
    Step 0: Portal Foundations          :p0, 0, 14
    Step 1: Portal Onboarding & KYC     :p1, 14, 28
    Step 2: Subscription & DebiCheck UI :p2, 28, 49
    Step 3: Affordability & Credit Sign :p3, 49, 70
    Step 4: Voucher Drawdowns & Tracker :p4, 70, 84
    Step 5: Arrears & Settings UI       :p5, 84, 98
```

---

## 🔑 Shared Architecture Contracts

### 📐 1. OpenAPI Client Generation
To ensure zero typing discrepancies, the **Shared Backend API** will publish an `openapi.json` file on build. 
* The **Kredo Portal** will run `ng-openapi-gen` to generate strongly-typed services and models for consumption.
* The **Marketing Site** will use a TypeScript fetch generator or fetch types from the schema.

### 🔗 2. Lead & UTM Capture Loop
1. When a user lands on the **Marketing Site** from an ambassador link or ad campaign (e.g., `kalahari.co.za/?ref=AMB123&utm_source=tiktok`), the page may pass those parameters directly through CTA links. Durable storage in a first-party cookie (`kalahari_attribution`) happens only after POPIA consent.
2. If they fill out the waitlist on the marketing site, the lead is posted to `POST api.kalahari.co.za/v1/leads` along with the attribution payload and granular POPIA consent details.
3. If they click **"Apply Now"**, they are redirected to `kredo.kalahari.co.za/apply?ref=AMB123&utm_source=tiktok`.
4. The **Kredo Portal** reads the query parameters, persists them in the application flow state, and submits them to `POST api.kalahari.co.za/v1/consumers` during registration.

### 💰 3. Ledger Precision Protocol
All systems must adhere to strict financial precision rules:
* All financial values in API payloads and database storage are **integer cents** (e.g., `10000` = `R100.00`).
* Rate computations, interest, and vat factors must use arbitrary-precision decimal libraries (`Prisma.Decimal` on backend, `decimal.js` if needed). Floating-point `number` type calculations are banned for money ledger items.
