# Step 2 — Subscription & DebiCheck Authentication

This step details building the subscription configuration forms, the banking credentials collection screens, the DebiCheck mandate confirmation wizard, and direct payment portals.

---

## 🎯 Objectives
* Build the Subscription Tier Selection interface.
* Create the Banking Details collection form.
* Program the DebiCheck Mandate Instruction page (directing users to authorize the debit order via USSD or banking app).
* Integrate instant EFT checkout overlays or redirects (e.g. Stitch/Ozow/Yoco).
* Assemble the primary dashboard navigation shell.

---

## 🔨 Tasks & Sub-Tasks

### 1. Subscription Tier Picker
- [ ] Create `SubscriptionPickerComponent` displaying subscription packages.
- [ ] Implement toggle mechanisms showing the monthly service fees and available credit tiers for each option.
- [ ] Ensure selection transitions to the mandate authentication flow.

### 2. DebiCheck Mandate Setup Wizard
- [ ] Build the **Banking Details Form** (Bank, Account Type, Account Number, Branch Code):
  * Apply reactive input validation checks (e.g. Luhn algorithm validation on account numbers).
- [ ] Build the **Mandate Disclosure Screen**:
  * Render a legally compliant summary card detailing the mandate terms: Max collection amount, collection day, and variable billing rules.
- [ ] Build the **Bank Auth Waiting Screen**:
  * Explain next steps clearly (e.g. "Open your FNB app / dial *120*... to approve the mandate request").
  * Implement an active polling mechanism or WebSocket listener that checks `/api/v1/subscriptions/status` for confirmation.
  * Show a countdown timer (e.g. 5 minutes) before prompting the user to retry.

### 3. Direct Repayments (Pay-Now UI)
- [ ] Build a `RepaymentComponent` enabling users to click "Pay Now" to clear arrears or cover monthly fees.
- [ ] Integrate Yoco/Ozow/Stitch checkout widgets:
  * Open the provider widget inside a modal iframe or redirect the browser.
  * Build redirect handler pages: `/repayments/success` and `/repayments/failure`.

### 4. Authenticated Dashboard Layout
- [ ] Design the main workspace layout: Sidebar navigation, Header component with profile controls, and main content area.
- [ ] Ensure layout is responsive, collapsible on mobile screens, and contains loading/error states.

---

## 🏛️ Code Structure Draft (Mandate Polling)

```typescript
import { Component, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mandate-wait',
  template: `
    <div class="p-6 text-center">
      <h3 class="text-xl font-bold">Approve mandate in your bank app</h3>
      <p class="text-slate-600 mt-2">Checking authorization status...</p>
      <div class="spinner border-t-blue-600 animate-spin w-8 h-8 rounded-full border-4 mx-auto my-6"></div>
      <p class="text-xs text-slate-400">Time remaining: {{ timer() }}s</p>
    </div>
  `
})
export class MandateWaitComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  timer = signal(300);

  constructor() {
    effect((onCleanup) => {
      const interval = setInterval(() => {
        this.timer.update(t => t - 1);
        this.checkMandateStatus();
      }, 3000);
      onCleanup(() => clearInterval(interval));
    });
  }

  checkMandateStatus() {
    this.http.get<{ status: string }>('/api/v1/subscriptions/status').subscribe({
      next: (res) => {
        if (res.status === 'AUTHENTICATED') {
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Account Number Validation Test:** Assert that submitting an invalid account number format prevents the form from executing and flags a validation error.
* **Polling Cancellation Test:** Verify that when the timer hits `0`, the polling loop is destroyed and the UI prompts the user to request a new mandate initialization.
* **PSP Redirect Guard Test:** Mock a checkout redirect trigger, verifying the HTTP redirect URL matches the backend response payload.

### Manual Verification
* Navigate the subscription wizard, input dummy sandbox banking details, click submit, and verify the loading spinner runs and displays instructions for approving sandbox DebiCheck mandates.
