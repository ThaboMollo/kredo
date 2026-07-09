# Step 4 — Credit Bureau Reporting & Statements

This step implements the core value proposition of Kredo: reporting positive repayment behaviors to credit bureaus so students can build credit history. It also manages monthly customer statements and progress tracking APIs.

---

## 🎯 Objectives
* Build batch files in standard formats required by South African credit bureaus (TransUnion / Experian / XDS / Compuscore).
* Implement the monthly bureau submission pipeline.
* Create endpoints to process bureau updates and customer data dispute rectifications.
* Implement the monthly account statement PDF compiler.
* Provide historical repayment progress telemetry for the frontend.

---

## 🔨 Tasks & Sub-Tasks

### 1. Bureau Submission Compiler
- [ ] Research and map the fixed-width or XML schema structures used by South African bureaus (e.g. Metro 2 format or specific TU/Experian layouts).
- [ ] Create a utility that collects consumer repayment metadata: payment state, amount due, amount paid, days in arrears, current balance, and account status code.
- [ ] Implement the batch generator to output formatting-compliant strings.

### 2. Batch Execution Pipeline
- [ ] Create a BullMQ worker executing monthly on the 1st of each month at `01:00 SAST`.
- [ ] Pull all active accounts and compile their history into the reporting file.
- [ ] Log the metadata of the output file in a `BureauSubmission` model.
- [ ] Encrypt the file and upload it securely via SFTP to the bureau target server.
- [ ] Set up notifications to alert the operations team of success or failure.

### 3. Bureau Dispute & Correction Service
- [ ] Expose an administrative endpoint `PATCH /api/v1/bureau/corrections` to manually adjust or flag disputed account histories.
- [ ] Store a record of corrections inside the audit log.
- [ ] Build logic to include corrected status records in the immediate next batch submission.

### 4. Monthly Statements PDF Generator
- [ ] Set up a monthly automated cron task to generate statements.
- [ ] Gather all double-entry ledger listings (`LedgerEntry`) for the user for the preceding calendar month.
- [ ] Render the Statement PDF showing: opening balance, items drawn (vouchers), repayments made, fee charges, interest accrued, and closing balance.
- [ ] Store the statements in S3/GCS and create a `Statement` DB record.
- [ ] Dispatch an email notifying the user that their statement is ready, containing a link to download the PDF.

### 5. Credit-Progress API
- [ ] Expose `GET /api/v1/credit-progress` returning:
  * Total scheduled payments vs. on-time payments.
  * Running streak of on-time installments.
  * Clean, descriptive disclaimer text explaining how reporting works.

---

## 🏛️ Database Schema Draft (Prisma)

```prisma
model BureauSubmission {
  id              String   @id @default(uuid())
  submissionDate  DateTime @default(now())
  filename        String
  recordCount     Int
  status          String   // PENDING, SUBMITTED, ACKNOWLEDGED, FAILED
  errorLog        String?
}

model Statement {
  id              String   @id @default(uuid())
  consumerId      String
  consumer        Consumer @relation(fields: [consumerId], references: [id])
  statementDate   DateTime
  periodStart     DateTime
  periodEnd       DateTime
  pdfUrl          String
  createdAt       DateTime @default(now())
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Bureau File Generation Test:** Seed 5 consumers with varying behaviors (1 on-time, 1 late, 1 in arrears, 2 newly active). Execute the compiler and assert that the text formatting matches the fixed-width requirements.
* **Statement Ledger Gathering Test:** Assert that only ledger entries corresponding to the target month range are included in the statements query.
* **Credit Progress Calculation Test:** Seed a history of 10 payments (8 on-time, 2 late) and verify the progress API returns exactly `80%` on-time performance.

### Manual Verification
* Run the statement generator manually for a test user, open the resulting PDF, and crosscheck that the ledger transaction values match the ledger entries in the database.
