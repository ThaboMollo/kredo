# Step 3 — Credit Core & Voucher Issuance

This step implements the primary business logic: the NCA-compliant affordability assessment, credit agreement document generation, e-sign validation, and the transactional voucher drawdown system.

---

## 🎯 Objectives
* Configure dated, versioned NCA fee and interest rate caps.
* Build the s81 Affordability Assessment engine.
* Set up HTML-to-PDF pre-agreement statements and contract generation.
* Implement revolving Credit Facility limit monitoring.
* Program closed-loop Voucher issuance with double-entry ledger integration.

---

## 🔨 Tasks & Sub-Tasks

### 1. NCA Config Rules Engine
- [ ] Define dynamic configuration rules in the database or config module for NCA limits: Max initiation fee, max monthly service fee, max interest rate APR.
- [ ] Implement validation logic that rejects any agreement setup whose fees exceed the active dated configuration rules.

### 2. Affordability Assessment Engine (s81)
- [ ] Expose `POST /api/v1/affordability` taking gross income, declared expenses, and external bureau debt obligations.
- [ ] Implement s81 calculation:
  $$\text{Net Disposable Income} = \text{Gross Income} - \text{Taxes} - \text{Declared Expenses} - \text{Bureau Obligations}$$
- [ ] Implement limit computation rules: Facility limit must be capped at a designated percentage of Net Disposable Income.
- [ ] Expose manual override endpoint for admin logs if a student disputes their calculation.

### 3. PDF Generator (Puppeteer / pdfmake)
- [ ] Set up Puppeteer or pdfmake integration inside NestJS.
- [ ] Build templates for:
  * **Pre-Agreement Statement & Quote:** Clearly displays the principal, initiation fee, service fee, interest rate, total repayment obligation, and payment dates.
  * **Credit Agreement:** Legal contract terms and NCA disclosures.
- [ ] Save generated files into secure private S3/GCS buckets.

### 4. E-Signing & Credit Facility Creation
- [ ] Build an endpoint `POST /api/v1/facilities/sign` verifying the client OTP/passkey.
- [ ] On confirmation, transition `CreditAgreement` to `SIGNED`, create the `CreditFacility` row with the approved limit, and allocate the starting receivable ledger values.
- [ ] Ensure step-up authentication is verified before finalizing.

### 5. Voucher Drawdown & API Integration
- [ ] Abstract voucher vendors behind `VoucherProviderPort`.
- [ ] Implement integration adapter (e.g. Blu, 1ForYou, or direct retailer voucher APIs):
  * **Request Voucher:** Calls external partner to issue code/QR.
  * **Callback webhook:** Listens for redemption status.
- [ ] Implement Drawdown ledger entries in a single database transaction (`POST /api/v1/drawdowns` with mandatory idempotency key):
  * **Drawdown Execution:**
    * **DR** `ConsumerReceivable` (Asset)
    * **CR** `VoucherLiability` (Liability)
  * **Voucher Settled** (when retailer confirms redemption):
    * **DR** `VoucherLiability` (Liability)
    * **CR** `CashClearing` (Asset)
  * **Voucher Cancelled / Expired:**
    * **DR** `VoucherLiability` (Liability)
    * **CR** `ConsumerReceivable` (Asset)

---

## 🏛️ Database Schema Draft (Prisma)

```prisma
model AffordabilityAssessment {
  id                 String   @id @default(uuid())
  consumerId         String
  consumer           Consumer @relation(fields: [consumerId], references: [id])
  grossIncome        BigInt
  declaredExpenses   BigInt
  bureauObligations  BigInt
  disposableIncome   BigInt
  approvedLimit      BigInt
  createdAt          DateTime @default(now())
}

model CreditAgreement {
  id             String   @id @default(uuid())
  consumerId     String
  consumer       Consumer @relation(fields: [consumerId], references: [id])
  quotePdfUrl    String
  agreementPdfUrl String
  signedAt       DateTime?
  status         String   // DRAFT, SIGNED, ACTIVE
  createdAt      DateTime @default(now())
}

model CreditFacility {
  id             String   @id @default(uuid())
  consumerId     String   @unique
  consumer       Consumer @relation(fields: [consumerId], references: [id])
  totalLimit     BigInt   // revolving max limit
  utilisedLimit  BigInt   // active drawdowns
  status         String   // ACTIVE, SUSPENDED
  createdAt      DateTime @default(now())
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **NCA Cap Calculation Test:** Test that the affordability calculator correctly computes and rejects a quote if the service fee is set to `R100` when the NCA cap config is `R60`.
* **Ledger Drawdown Balancing Test:** Perform a mocked drawdown, assert that the ledger writes equal debits/credits, and verify that the consumer's available credit limit is decremented exactly by the drawdown amount.
* **Idempotent Drawdown Request Test:** Fire two concurrent HTTP POST requests to `/api/v1/drawdowns` with the identical `Idempotency-Key` header; assert that the voucher api adapter is only called once and returns a `200 OK` for both.

### Manual Verification
* Execute the affordability calculation, generate the PDFs, download them and manually verify the rendering quality, layout structure, and font legibility.
