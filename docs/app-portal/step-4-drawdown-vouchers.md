# Step 4 — Drawdowns & Voucher Viewer

This step implements the student wallet: drawdown forms, closed-loop voucher code/QR viewer components, monthly repayment histories, and credit-building progress charts.

---

## 🎯 Objectives
* Build the Retail Partner selector and voucher drawdown forms.
* Implement UX-only drawdown limit hints using Signals while treating the backend as the authority for available balance and approval.
* Construct the active Voucher Wallet displaying alphanumeric codes, barcodes, and QR components.
* Build the transaction ledger dashboard and PDF statement download links.
* Render the credit history builder dashboard with progress metrics.

---

## 🔨 Tasks & Sub-Tasks

### 1. Voucher Drawdown Form
- [ ] Create `DrawdownComponent` displaying eligible retail merchants.
- [ ] Implement an amount selection input:
  * Dynamically fetch the user's current available credit limit using Signals.
  * Disable obviously invalid values that exceed the latest backend-reported available credit limit or merchant voucher thresholds.
  * Submit the drawdown request to the backend with an idempotency key; the backend must re-check facility status, available limit, merchant thresholds, and step-up authorization before issuing a voucher.
- [ ] Require step-up authorization (e.g., PIN, Passkey, or SMS OTP) before submitting drawdown transactions to the API.

### 2. Closed-Loop Voucher Wallet
- [ ] Create `VoucherWalletComponent` displaying active, redeemed, and expired vouchers.
- [ ] Integrate a barcode/QR code rendering library (e.g. `@ngx-barcode/core` or similar lightweight package, defer-loaded):
  * Display the voucher code, barcode, and QR code for scanning at retail points of sale.
  * Render an indicator showing remaining days until voucher expiration.

### 3. Repayment History & Statements List
- [ ] Build `RepaymentsComponent` rendering a ledger table of payments, drawdowns, and monthly subscription charges.
- [ ] Expose the **Statement Downloads** section:
  * List historical monthly statement dates.
  * Add buttons linking to the backend's `/api/v1/statements/{id}/pdf` secure resource.

### 4. Credit Progress Tracker
- [ ] Design the `CreditProgressComponent` showing:
  * Repayment consistency percentage (e.g., "95% of your payments have been on time!").
  * A milestone dashboard displaying historical reporting points (e.g., "3 months of history reported to TransUnion").
  * Transparent informational tooltips describing how credit reporting affects credit profiles.

---

## 🏛️ Code Structure Draft (Limit Validation Signal)

```typescript
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-drawdown-form',
  template: `
    <div>
      <p>Available Balance: {{ formatCents(availableBalanceCents()) }}</p>
      <input inputmode="numeric" [value]="amountCents()" (input)="updateAmountCents($event)" class="border p-2 rounded"/>
      @if (isOverLimit()) {
        <p class="text-red-500 text-xs mt-1">Amount exceeds your available limit!</p>
      }
    </div>
  `
})
export class DrawdownFormComponent {
  availableBalanceCents = signal(150000);
  amountCents = signal(0);

  isOverLimit = computed(() => this.amountCents() > this.availableBalanceCents());

  updateAmountCents(event: Event) {
    const digitsOnly = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    this.amountCents.set(Number.parseInt(digitsOnly || '0', 10));
  }

  formatCents(cents: number) {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);
  }
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Drawdown Limit Warning Test:** Input an amount higher than the `availableBalance` Signal, and assert that the computed `isOverLimit` Signal evaluates to `true`.
* **Backend Authority Test:** Mock a stale available balance in the UI and assert that the API rejection from `POST /api/v1/drawdowns` is shown clearly without issuing or displaying a voucher.
* **QR Code Rendering Deferral Test:** Verify that the QR code library is not loaded on main bundle initialization, but deferred until a voucher detail panel is expanded.
* **Statements Downloader Navigation Test:** Verify clicking the download statement link passes active authorization headers or secure session tokens.

### Manual Verification
* Navigate to the drawdown panel, request a test voucher, check that the wallet displays a barcode/QR code, and verify that the credit progress tracker renders on mobile layouts.
