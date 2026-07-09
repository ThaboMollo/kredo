-- Kredo SQL Schema & Stored Procedures (POPIA & Double-Entry Ledger)

-- 1. Consumers
CREATE TABLE "Consumer" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "emailEncrypted" VARCHAR(512) UNIQUE NOT NULL,
  "idNumberEncrypted" VARCHAR(512) UNIQUE,
  "mobileEncrypted" VARCHAR(512),
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  "kycStatus" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "studentVerified" BOOLEAN NOT NULL DEFAULT false,
  "studentCardDocUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Consents (POPIA compliance audit log)
CREATE TABLE "Consent" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consumerId" UUID NOT NULL REFERENCES "Consumer"("id") ON DELETE CASCADE,
  "consentType" VARCHAR(100) NOT NULL,
  "status" VARCHAR(50) NOT NULL,
  "version" VARCHAR(50) NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Leads (Waitlist acquisition)
CREATE TABLE "Lead" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "fullName" VARCHAR(255) NOT NULL,
  "mobile" VARCHAR(50),
  "university" VARCHAR(255),
  "processingConsent" BOOLEAN NOT NULL DEFAULT false,
  "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Subscriptions
CREATE TABLE "Subscription" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consumerId" UUID NOT NULL REFERENCES "Consumer"("id") ON DELETE CASCADE,
  "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "planCode" VARCHAR(100) NOT NULL,
  "nextBilling" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Mandates (DebiCheck banking details)
CREATE TABLE "Mandate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consumerId" UUID NOT NULL REFERENCES "Consumer"("id") ON DELETE CASCADE,
  "bankCode" VARCHAR(50) NOT NULL,
  "accountNumber" TEXT NOT NULL, -- Encrypted at rest
  "mandateRef" VARCHAR(100) UNIQUE NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Affordability Assessments (NCA Compliance)
CREATE TABLE "AffordabilityAssessment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consumerId" UUID NOT NULL REFERENCES "Consumer"("id") ON DELETE CASCADE,
  "grossIncome" BIGINT NOT NULL,
  "declaredExpenses" BIGINT NOT NULL,
  "bureauObligations" BIGINT NOT NULL,
  "disposableIncome" BIGINT NOT NULL,
  "approvedLimit" BIGINT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Credit Agreements
CREATE TABLE "CreditAgreement" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consumerId" UUID NOT NULL REFERENCES "Consumer"("id") ON DELETE CASCADE,
  "quotePdfUrl" TEXT,
  "agreementPdfUrl" TEXT,
  "signedAt" TIMESTAMPTZ,
  "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Credit Facilities
CREATE TABLE "CreditFacility" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consumerId" UUID UNIQUE NOT NULL REFERENCES "Consumer"("id") ON DELETE CASCADE,
  "totalLimit" BIGINT NOT NULL,
  "utilisedLimit" BIGINT NOT NULL DEFAULT 0,
  "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Vouchers
CREATE TABLE "Voucher" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consumerId" UUID NOT NULL REFERENCES "Consumer"("id") ON DELETE CASCADE,
  "merchantName" VARCHAR(255) NOT NULL,
  "amount" BIGINT NOT NULL,
  "code" VARCHAR(100) UNIQUE NOT NULL,
  "qrValue" TEXT NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
  "expiryDate" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Ledger Accounts (Double-Entry core)
CREATE TABLE "LedgerAccount" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(100) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Ledger Transactions (Balanced double-entry receipts)
CREATE TABLE "LedgerTransaction" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "idempotencyKey" VARCHAR(255) UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "postedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Ledger Entries
CREATE TABLE "LedgerEntry" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "transactionId" UUID NOT NULL REFERENCES "LedgerTransaction"("id") ON DELETE CASCADE,
  "accountId" UUID NOT NULL REFERENCES "LedgerAccount"("id") ON DELETE RESTRICT,
  "amount" BIGINT NOT NULL,
  "direction" VARCHAR(50) NOT NULL -- DEBIT / CREDIT
);

-- Stored Procedure: Atomic Balanced Double-Entry Postings
CREATE OR REPLACE FUNCTION create_ledger_transaction(
  p_idempotency_key VARCHAR(255),
  p_description TEXT,
  p_entries JSONB[] -- Array of JSON records: {"accountId": "...", "amount": 100, "direction": "DEBIT"/"CREDIT"}
) RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
  v_entry JSONB;
  v_sum_debits BIGINT := 0;
  v_sum_credits BIGINT := 0;
  v_entry_amount BIGINT;
  v_entry_direction VARCHAR(50);
  v_entry_account_id UUID;
  i INT;
BEGIN
  -- 1. Check idempotency
  SELECT id INTO v_transaction_id FROM "LedgerTransaction" WHERE "idempotencyKey" = p_idempotency_key;
  IF FOUND THEN
    RETURN jsonb_build_object('id', v_transaction_id, 'status', 'IDEMPOTENT');
  END IF;

  -- 2. Validate matching debits and credits sum
  FOR i IN 1 .. array_length(p_entries, 1) LOOP
    v_entry := p_entries[i];
    v_entry_amount := (v_entry->>'amount')::BIGINT;
    v_entry_direction := v_entry->>'direction';
    
    IF v_entry_direction = 'DEBIT' THEN
      v_sum_debits := v_sum_debits + v_entry_amount;
    ELSIF v_entry_direction = 'CREDIT' THEN
      v_sum_credits := v_sum_credits + v_entry_amount;
    ELSE
      RAISE EXCEPTION 'Invalid entry direction: %', v_entry_direction;
    END IF;
  END LOOP;

  IF v_sum_debits != v_sum_credits THEN
    RAISE EXCEPTION 'Unbalanced transaction: sum of debits (%) must equal sum of credits (%)', v_sum_debits, v_sum_credits;
  END IF;

  -- 3. Create transaction record
  INSERT INTO "LedgerTransaction" ("id", "idempotencyKey", "description", "postedAt")
  VALUES (gen_random_uuid(), p_idempotency_key, p_description, NOW())
  RETURNING id INTO v_transaction_id;

  -- 4. Create matching entries
  FOR i IN 1 .. array_length(p_entries, 1) LOOP
    v_entry := p_entries[i];
    v_entry_amount := (v_entry->>'amount')::BIGINT;
    v_entry_direction := v_entry->>'direction';
    v_entry_account_id := (v_entry->>'accountId')::UUID;

    INSERT INTO "LedgerEntry" ("id", "transactionId", "accountId", "amount", "direction")
    VALUES (gen_random_uuid(), v_transaction_id, v_entry_account_id, v_entry_amount, v_entry_direction);
  END LOOP;

  RETURN jsonb_build_object('id', v_transaction_id, 'status', 'CREATED');
END;
$$ LANGUAGE plpgsql;
