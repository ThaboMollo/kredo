# Step 2 — Money Rails & DebiCheck Integration

This step details the integration of South Africa's debit order infrastructure (DebiCheck), the payment service providers (PSP) for cash settlements, and the ledger posting automation when payments occur.

---

## 🎯 Objectives
* Model subscription plans, Billing state-machine, and mandate lifecycles.
* Integrate **DebiCheck** mandate authentication loops via payment service providers.
* Integrate Yoco/Ozow/Stitch/Peach PSPs for direct card or instant EFT repayments.
* Build automated ledger entries for subscription creation, payments, and settlements.
* Implement a daily payment reconciliation worker.

---

## 🔨 Tasks & Sub-Tasks

### 1. Subscription & Mandate Modelling
- [ ] Create `Subscription` and `Mandate` Prisma models.
- [ ] Implement subscription status state machine: `PENDING` -> `ACTIVE` -> `PAST_DUE` -> `CANCELLED`.
- [ ] Implement mandate status tracker: `INITIATED` -> `AUTHENTICATED` -> `SUSPENDED` -> `CANCELLED`.

### 2. DebiCheck Integration
- [ ] Abstract mandate flows behind `DebitMandatePort`.
- [ ] Implement adapter for BankservAfrica/DebiCheck aggregator API:
  * **Initiate Mandate Request:** Submits details (bank, account number, branch code, max monthly collection limit) when the user sets up their subscription.
  * **Webhook handler:** Secure endpoint `POST /api/v1/webhooks/debicheck` to receive mandate authentication success or rejection alerts from the customer's bank.
  * **Mandate query API:** Fallback cron job to poll state if webhooks fail.

### 3. Direct Repayments (Pay-Now)
- [ ] Integrate instant EFT/card provider (e.g., Yoco / Ozow / Stitch).
- [ ] Expose endpoint `POST /api/v1/repayments/pay-now` returning a payment widget URL or token.
- [ ] Implement secure webhook processing for payment completions:
  * Validate webhook cryptographic signature.
  * Emit internal `PaymentReceivedEvent` using transactional outbox patterns.

### 4. Ledger Postings for Cash & Fees
- [ ] Implement database transactional listeners that handle financial events:
  * **Subscription Billed:** When a subscription cycle hits, debit the consumer receivable account and credit the subscription income account.
    * **DR** `ConsumerReceivable` (Asset)
    * **CR** `SubscriptionIncome` (Revenue)
  * **Repayment Received:** When cash is cleared by the PSP:
    * **DR** `CashClearing` (Asset)
    * **CR** `ConsumerReceivable` (Asset)
  * **PSP Payout / Bank Settlement:** When funds settle from the PSP to Kalahari's main bank account:
    * **DR** `BankAccount` (Asset)
    * **CR** `CashClearing` (Asset)

### 5. Daily Reconciliation Job
- [ ] Set up a BullMQ worker executing daily at `02:00 SAST`.
- [ ] Fetch transactions from the PSP API for the previous 24 hours.
- [ ] Cross-match each external transaction against the internal ledger `CashClearing` entries using the transaction reference.
- [ ] Mark entries as `RECONCILED` or flag anomalies to a manual compliance queue (`ReconciliationDiscrepancy` table).

---

## 🏛️ Database Schema Draft (Prisma)

```prisma
enum SubscriptionStatus {
  PENDING
  ACTIVE
  PAST_DUE
  CANCELLED
}

model Subscription {
  id          String             @id @default(uuid())
  consumerId  String
  consumer    Consumer           @relation(fields: [consumerId], references: [id])
  status      SubscriptionStatus @default(PENDING)
  planCode    String             // e.g. "STUDENT_BASIC"
  nextBilling DateTime
  createdAt   DateTime           @default(now())
}

enum MandateStatus {
  INITIATED
  AUTHENTICATED
  REJECTED
  CANCELLED
}

model Mandate {
  id              String        @id @default(uuid())
  consumerId      String
  consumer        Consumer      @relation(fields: [consumerId], references: [id])
  bankCode        String
  accountNumber   String        // Encrypted
  mandateRef      String        @unique // DebiCheck reference
  status          MandateStatus @default(INITIATED)
  createdAt       DateTime      @default(now())
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Ledger Subscription Billing Test:** Seed a consumer, trigger subscription billing, and verify that the ledger records the correct debit/credit matching amounts.
* **Webhook Signature Validation Test:** Assert that a webhook request with an invalid signature header throws a 401 Unauthorized exception and does not write to the database.
* **Reconciliation Worker Edge Cases:** Mock a scenario where the PSP reports 3 payments, but the ledger only lists 2; assert that the worker logs a discrepancy case file.

### Manual Verification
* Trigger a test payment checkout endpoint, verify it generates a valid sandbox checkout URL, perform a sandbox payment, and check the consumer dashboard API to see the payment credited.
