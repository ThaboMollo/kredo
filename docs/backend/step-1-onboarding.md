# Step 1 — Onboarding, KYC & Student Verification

This step establishes the user registration workflows, secure storage of Personally Identifiable Information (PII) under POPIA guidelines, FICA (identity + liveness) checks, and verification of student enrollment.

---

## 🎯 Objectives
* Implement the student consumer registry with encrypted database fields.
* Establish an append-only POPIA Consent audit trail.
* Build integration adapters for South African ID verification and Selfie Liveness check.
* Build student verification handlers (automatic match vs. manual document review).

---

## 🔨 Tasks & Sub-Tasks

### 1. Consumer Entity & Encryption
- [ ] Define the `Consumer` database model with fields for FICA verification state and enrollment verification state.
- [ ] Implement an encryption utility or database lifecycle middleware (e.g. Prisma middleware or NestJS interceptor) using AES-256-GCM to automatically encrypt/decrypt critical fields: `idNumber`, `mobileNumber`, `emailAddress`, and `physicalAddress` at rest.
- [ ] Configure PostgreSQL schema column sizes to account for ciphertext block sizing.

### 2. POPIA Consent Audit Ledger
- [ ] Define the `Consent` database model.
- [ ] Create an append-only transaction logic where each consent change (e.g. `granted` or `withdrawn`) generates a new row.
- [ ] Mandate the capture of: Consent Type (e.g. `BUREAU_ENQUIRY`, `BUREAU_REPORTING`, `MARKETING`), timestamp, client IP, client user-agent, and version of the consent text.
- [ ] Expose GET `/consumers/me/consents` and POST `/consumers/me/consents` with version tracking.

### 3. FICA / KYC Integration (SA ID & Liveness)
- [ ] Abstract FICA verification behind a domain port: `FicaVerificationPort`.
- [ ] Implement an adapter targeting the selected provider SDK (e.g., identity verification against DHA/Credit Bureau records).
- [ ] Implement the Selfie Liveness adapter:
  * Backend generates a signed transaction token for the frontend to upload selfie captures directly to the provider.
  * Backend exposes a webhook endpoint `POST /api/v1/webhooks/fica` to handle the asynchronous FICA verification outcome securely (signed request validation).
- [ ] Model the state machine for KYC statuses: `PENDING` -> `VERIFIED` / `FAILED` / `MANUAL_REVIEW`.

### 4. Student Verification Engine
- [ ] Abstract student verification behind `StudentVerificationPort`.
- [ ] Implement automated checks:
  * **Email Domain Match:** Verification link sent to university email (e.g., `student@uct.ac.za`).
  * **Registry Match:** Check against bursary or NSFAS list database records.
- [ ] Implement a manual fallback flow:
  * Expose an endpoint to upload a Student Card / enrollment document (uploading to a private S3/GCS bucket).
  * Flag state as `MANUAL_REVIEW` and create a pending case file in the database.

---

## 🏛️ Database Schema Draft (Prisma)

```prisma
enum KYCStatus {
  PENDING
  VERIFIED
  FAILED
  MANUAL_REVIEW
}

model Consumer {
  id                  String             @id @default(uuid())
  emailEncrypted      String             @unique
  idNumberEncrypted   String?            @unique
  mobileEncrypted     String?
  firstName           String
  lastName            String
  kycStatus           KYCStatus          @default(PENDING)
  studentVerified     Boolean            @default(false)
  studentCardDocUrl   String?
  consents            Consent[]
  createdAt           DateTime           @default(now())
}

enum ConsentStatus {
  GRANTED
  WITHDRAWN
}

model Consent {
  id             String        @id @default(uuid())
  consumerId     String
  consumer       Consumer      @relation(fields: [consumerId], references: [id])
  consentType    String        // e.g., "PROCESSING", "BUREAU_REPORTING", "MARKETING"
  status         ConsentStatus
  version        String        // Tracks the terms of service version
  ipAddress      String
  userAgent      String
  timestamp      DateTime      @default(now())
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Encryption Decryption Unit Test:** Assert that inserting a Consumer writes scrambled data to raw SQL, and reading the Consumer model returns the cleartext string.
* **Consent Append-Only Test:** Assert that attempting to UPDATE a consent row directly via Prisma throws a validation error or fails (enforce via DB triggers or domain constraints).
* **Mock Provider Flow:** Write integration tests mocking success, rejection, and liveness mismatch webhook responses to verify consumer status transitions.

### Manual Verification
* Trigger the registration endpoint via Postman, review the raw Postgres database tables to confirm that the email, mobile number, and ID number are ciphertext.
* Upload a dummy student card, and verify in the admin dashboard database query that the consumer status updates to `MANUAL_REVIEW`.
