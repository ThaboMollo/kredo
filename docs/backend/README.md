# 🧰 Shared Platform Backend API — Track Index

The shared platform backend is a **NestJS** application designed using Clean Architecture / Domain-Driven Design (DDD) principles. It is responsible for all compliance enforcement, double-entry ledger postings, third-party integrations, and serving API requests for both the Kalahari marketing site and the Kredo application portal.

---

## 🛠️ Tech Stack Recap
* **Framework:** NestJS (Node 20 LTS, TypeScript)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Task Queue:** BullMQ with Redis
* **Hosting/Deploy:** AWS (Region: `af-south-1` Cape Town) or Azure SA North for POPIA-compliant data residency.

---

## 📂 Implementation Steps

Click on any step below to see its detailed step-by-step implementation plan:

1. **[Step 0: Foundations & Double-Entry Ledger Core](file:///Users/mollomponya/Documents/Dev/kredo/docs/backend/step-0-foundations.md)**
   * Bootstrap NestJS, configure Prisma, set up Postgres, implement the core double-entry ledger engine and run ledger verification tests.
2. **[Step 1: Onboarding, KYC & Student Verification](file:///Users/mollomponya/Documents/Dev/kredo/docs/backend/step-1-onboarding.md)**
   * Build the consumer registry, encrypted PII storage, audit logs for POPIA consents, and integrate SA ID validation + selfie liveness + student verification adapters.
3. **[Step 2: Money Rails & DebiCheck Integration](file:///Users/mollomponya/Documents/Dev/kredo/docs/backend/step-2-money-rails.md)**
   * Establish subscription lifecycle logic, integrate the DebiCheck authenticated debit order flow, configure payment service providers (PSP) for instant EFT/card payments, and hook up the ledger posting engine.
4. **[Step 3: Credit Core & Voucher Issuance](file:///Users/mollomponya/Documents/Dev/kredo/docs/backend/step-3-credit-core.md)**
   * Build the NCA-compliant affordability assessment engine, credit pre-agreement statement & quote PDF generator, e-signature tracking, credit facility accounts, and closed-loop voucher issuance APIs.
5. **[Step 4: Credit Bureau Reporting & Statements](file:///Users/mollomponya/Documents/Dev/kredo/docs/backend/step-4-bureau-reporting.md)**
   * Set up monthly credit bureau data generation (TransUnion/Experian format), build dispute correction channels, generate monthly statements (PDF via Puppeteer), and expose credit tracking endpoints.
6. **[Step 5: Care, Arrears & Scale](file:///Users/mollomponya/Documents/Dev/kredo/docs/backend/step-5-arrears-and-scale.md)**
   * Program a humane collections system, execute Section 129 tracking, build complaints escalation pipelines, and set up retailer B2B discount and commission reconciliation.

---

## 🏛️ Architectural Structure
The project follows a modular structure separated into:
* `domain/`: Pure business rules, entities, and use-cases (e.g., Ledger posting balancing rules, NCA fee caps, affordability calculation). No framework dependencies.
* `application/`: Application-specific use cases, DTOs, and interface declarations (ports).
* `infra/`: Implementations of database access (Prisma repository adapters), external service integrations (bureau, KYC provider, PSP), and HTTP controllers (REST API routers).
