# Step 5 — Care, Arrears & Scale

This step implements the operations backend: humane credit collections, legal Section 129 notice tracking, customer complaints management, and merchant B2B settlement engines.

---

## 🎯 Objectives
* Program the collections lifecycle and grace period automation.
* Automate the compilation and dispatch logs for Section 129 notices.
* Set up a double-entry provisioning/impairment ledger for defaults.
* Establish B2B retailer onboarding and discount reconciliation.

---

## 🔨 Tasks & Sub-Tasks

### 1. Collections & Arrears State Machine
- [ ] Implement an automated daily job to sweep facilities and identify overdue balances.
- [ ] Define the arrears workflow lifecycle:
  * **Grace Period (Days 1–5):** Dispatch gentle SMS/email reminders. No fees or bureau warnings.
  * **Mild Collections (Days 6–20):** Send regular alerts. Propose flexible repayment restructuring.
  * **Serious Collections (Days 20+):** Initiate formal warnings, suspend the credit facility, and mark as overdue in bureau files.

### 2. Section 129 Compliance Engine
- [ ] Implement notice compiling for NCA Section 129 (letter of demand giving options to refer to debt counselor).
- [ ] Build the dispatch log:
  * Record date sent, postal tracking number (or digital tracking receipt), and target physical/email address.
  * Enforce the statutory 10-business-day waiting period before initiating any legal action or debt sale.

### 3. Provisioning & Impairment Ledger Postings
- [ ] Set up ledger triggers to record expected defaults according to credit policy:
  * **Impairment Provisioning** (when a payment is >30 days late):
    * **DR** `Impairment` (Expense Account)
    * **CR** `ProvisionForBadDebts` (Asset Contra Account)
  * **Write-Off Execution** (when an account is formally written off):
    * **DR** `ProvisionForBadDebts`
    * **CR** `ConsumerReceivable`

### 4. Retailer B2B Reconciliation Engine
- [ ] Define the `Merchant` and `MerchantReconciliation` Prisma models.
- [ ] Implement discount tracking:
  * When a voucher is issued for R100 at a retailer with a 5% discount, Kalahari owes the retailer R95.
  * Register the discount margin:
    * **DR** `CashClearing` (Asset)
    * **CR** `ReconciledMerchantRevenue` (Revenue)
- [ ] Build a reconciliation dashboard that matches active/redeemed voucher transaction codes against retailer billing invoices.

### 5. Complaints and Ombud Cases Tracking
- [ ] Build a database schema and API to log student customer disputes.
- [ ] Track response deadlines to meet statutory requirements (e.g. Credit Ombud response times).

---

## 🏛️ Database Schema Draft (Prisma)

```prisma
model CaseFile {
  id              String   @id @default(uuid())
  consumerId      String
  consumer        Consumer @relation(fields: [consumerId], references: [id])
  type            String   // ARREARS, COMPLAINT, OMBUD
  status          String   // OPEN, SECTION_129_SENT, ESCALATED, RESOLVED
  notes           String
  nextReviewDate  DateTime
  createdAt       DateTime @default(now())
}

model Merchant {
  id              String   @id @default(uuid())
  name            String   @unique
  discountPercent Decimal  // e.g. 0.05 (5%)
  apiSecret       String   // Encrypted B2B credentials
  createdAt       DateTime @default(now())
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Impairment Entry Balancing Test:** Test that the impairment job creates balancing ledger entries and does not modify consumer credit balances directly.
* **Section 129 Escalation Delay Test:** Test that attempting to flag a case for legal escalation before 10 business days have passed since the Section 129 notice date throws a business rule validation error.
* **Merchant Discount Math Test:** Seed a merchant with a 3% discount, run a voucher redemption simulation, and assert that the cash clearing value is recorded as `97.00` and the revenue is `3.00`.

### Manual Verification
* Access the admin case panel, log a complaints case, transition it to "Section 129 Sent" status, and check that the consumer dashboard displays correct flags.
