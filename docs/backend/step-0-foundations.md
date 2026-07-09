# Step 0 — Foundations & Double-Entry Ledger Core

This step establishes the boilerplate, core architectural structures, database schema, and the fundamental financial engine: the double-entry ledger.

---

## 🎯 Objectives
* Initialize the NestJS framework project with strict TypeScript settings.
* Set up database migrations with Prisma ORM and PostgreSQL.
* Implement the core double-entry ledger database schema and validation logic.
* Ensure all monetary computations avoid JS floating-point numbers by enforcing integer cents and arbitrary-precision decimal mathematics.
* Generate and expose the OpenAPI / Swagger configuration.
* Expose the first public marketing endpoints needed for the Kalahari acquisition MVP.

---

## 🔨 Tasks & Sub-Tasks

### 1. Project Initialisation
- [ ] Scaffold NestJS project: `npx -y @nestjs/cli new kredo-backend --package-manager npm`
- [ ] Configure `tsconfig.json` to enforce strict type checking, no implicit returns, and strict null checks.
- [ ] Set up Docker Compose for local dependencies (PostgreSQL v16, Redis v7).
- [ ] Configure environment variable loading with `@nestjs/config` and Validation (using `joi` or `zod`).

### 2. Database & ORM Config
- [ ] Install Prisma Client: `npm install @prisma/client` and `npm install -D prisma`
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Define basic database models in `prisma/schema.prisma` (excluding feature-specific models for now).
- [ ] Configure migrations scripts in `package.json`.

### 3. Double-Entry Ledger Core Implementation
- [ ] Define the Ledger Database Schema:
  * **LedgerAccount**: Represents a financial bucket (Asset, Liability, Equity, Revenue, Expense). Holds account name, code, type, and metadata.
  * **LedgerEntry**: A single debit/credit line item. Links to a LedgerAccount, has a transaction ID, timestamp, amount (in integer cents, represented as `BIGINT`), debit/credit direction indicator, and description.
  * **LedgerTransaction**: Groups ledger entries together. Contains an idempotency key, transaction source type, description, and timestamp.
- [ ] Define Ledger Domain Entity & Validation Business Rules (`domain/ledger/`):
  * A ledger transaction is valid ONLY if the sum of all debits equals the sum of all credits ($\sum \text{debits} = \sum \text{credits}$).
  * A transaction must contain at least 2 entries.
  * Ledger accounts must prevent manual direct overrides; balances are calculated dynamically using sum queries.
- [ ] Create the database repository wrapper with Prisma interactive transactions (`$transaction`) to commit transactions atomically.

### 4. Mathematical Precision Enforcement
- [ ] Configure ESLint rules to warn or fail if normal JavaScript float arithmetic is applied to variables designated as currency.
- [ ] Install and configure `decimal.js` or use Prisma's native `Decimal` support for interest rates, VAT, and percentage calculations.

### 5. Task Queuing & Scheduler
- [ ] Setup Redis connection via `BullMQ` using `@nestjs/bull`.
- [ ] Install `@nestjs/schedule` for CRON-based reconciliation and reporting sweeps.

### 6. OpenAPI Documentation & Shell
- [ ] Configure Swagger module in `main.ts` using `@nestjs/swagger`.
- [ ] Write a script to export the raw `openapi.json` to a shared volume or path during build, so the frontend can pull it.

### 7. Public Marketing API Surface
- [ ] Define and publish the `POST /api/v1/leads` contract in OpenAPI before the marketing site is built against it.
- [ ] Persist lead records with granular consent text version, timestamp, source URL, attribution payload, and double opt-in state.
- [ ] Add bot and abuse controls: IP/user-agent rate limits, Turnstile/hCaptcha verification support, idempotency for repeat form posts, and structured spam flags.
- [ ] Add endpoints or queued workflows for double opt-in email and ambassador/campus-partner lead routing.
- [ ] Keep this module isolated from authenticated consumer onboarding so waitlist leads do not become credit applicants until the portal registration flow creates a `Consumer`.

---

## 🏛️ Database Schema Draft (Prisma)

```prisma
enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

model LedgerAccount {
  id          String        @id @default(uuid())
  code        String        @unique // e.g. "1000-RECEIVABLES"
  name        String
  type        AccountType
  entries     LedgerEntry[]
  createdAt   DateTime      @default(now())
}

model LedgerTransaction {
  id             String        @id @default(uuid())
  idempotencyKey String        @unique
  description    String
  createdAt      DateTime      @default(now())
  entries        LedgerEntry[]
}

enum EntryDirection {
  DEBIT
  CREDIT
}

model LedgerEntry {
  id            String            @id @default(uuid())
  transactionId String
  transaction   LedgerTransaction @relation(fields: [transactionId], references: [id])
  accountId     String
  account       LedgerAccount     @relation(fields: [accountId], references: [id])
  amount        BigInt            // Amount in integer cents (e.g. 10000 = R100.00)
  direction     EntryDirection
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Ledger Balancing Unit Tests:** Write unit tests to check that the transaction builder throws an exception if $\sum \text{debits} \neq \sum \text{credits}$.
* **Concurrency Integration Test:** Run a test firing 100 concurrent drawdowns using identical idempotency keys; verify only 1 transaction is recorded in the ledger database.
* **Double-Entry Balance Verification:** Seed accounts with mock drawdowns and payments, run aggregate queries, and verify that the equation $\text{Assets} = \text{Liabilities} + \text{Equity}$ holds true.
* **Lead Endpoint Contract Test:** Submit a valid waitlist payload with attribution and consent versions; assert that the lead is persisted, no `Consumer` is created, and the OpenAPI schema matches the marketing client.
* **Lead Abuse Test:** Submit repeated or bot-flagged lead payloads and assert that rate limiting prevents database spam.

### Manual Verification
* Access the Swagger UI (`http://localhost:3000/api/docs`) and verify that all schemas and endpoints are correctly rendered.
