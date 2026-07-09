# Step 3 — Affordability Wizard & Credit Signing

This step implements the multi-step Signal Forms wizard for the NCA affordability assessment, the pre-agreement quote presentation, and the digital e-signing interface.

---

## 🎯 Objectives
* Build the s81 Affordability Assessment input forms using Signal Forms.
* Present the legally mandated Pre-Agreement Statement & Quote.
* Integrate an in-browser PDF contract viewer with e-signature capture.
* Wire OTP/Passkey verification to authorize the binding credit agreement.

---

## 🔨 Tasks & Sub-Tasks

### 1. Affordability Assessment Wizard (Signal Forms)
- [ ] Create `AffordabilityWizardComponent` utilizing Signal Forms:
  * **Step 1: Income details:** Input fields for monthly income (salary, allowance, NSFAS funds).
  * **Step 2: Monthly Expenses:** Input fields for rent, food, transport, and utilities.
  * **Step 3: Verification:** Display declared expenses side-by-side with credit bureau records; prompt user to acknowledge or explain variances.
- [ ] Submit declared values to the backend affordability endpoint and render the backend response. The portal may validate required fields and formatting, but it must not compute approval, disposable income, fee caps, or facility limits as authoritative business decisions.

### 2. Pre-Agreement Statement & Quote Presentation
- [ ] Build a rendering template matching South African NCA disclosure requirements:
  * Clearly output the approved Credit Facility revolving limit.
  * Output a breakdown of fees: Initiation Fee (one-off), Service Fee (monthly), Interest Rate (APR).
  * Render an illustrative repayment schedule assuming full utilization.
  * Require the user to click "I Accept the Quote" to generate the final credit contract.

### 3. Credit Agreement Document Viewer & E-Signature
- [ ] Integrate a document viewer using an iframe or safe PDF renderer (using `@defer` to avoid bloating initial load size).
- [ ] Create a signature confirmation block:
  * Checkbox: "I agree to the terms of the Credit Agreement and understand my obligations."
  * **Digital Signature Input:** Implement a canvas signature capture module or structured text input verifying the user's full name.

### 4. OTP / Passkey Signing Verification
- [ ] Prompt the user to perform step-up authentication (verifying an OTP sent via SMS/Email or using WebAuthn/Passkeys).
- [ ] On authentication confirmation, submit the signed payload to the backend `POST /api/v1/facilities/sign`.
- [ ] Transition the interface to a celebratory success state explaining the facility is now active.

---

## 🏛️ Code Structure Draft (Canvas Signature Pad)

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-signature-pad',
  template: `
    <div class="border rounded-lg bg-slate-50 p-4">
      <canvas #sigCanvas class="border bg-white w-full h-40 cursor-crosshair touch-none"></canvas>
      <button (click)="clear()" class="mt-2 text-xs text-red-500">Clear Signature</button>
    </div>
  `
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('sigCanvas') sigCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;

  ngAfterViewInit() {
    const canvas = this.sigCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    // Setup drawing event listeners (mouse & touch)
  }

  clear() {
    const canvas = this.sigCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Affordability API Contract Test:** Input `R5000` income and `R3000` expenses, submit the payload to a mocked generated OpenAPI client, and assert that the UI renders the backend-returned disposable income, approved limit, and quote reference without recomputing them client-side.
* **Signature Consent Guard Test:** Verify that the "Sign & Confirm" API call cannot be triggered unless the agreement checkbox has been checked and the canvas element is not blank.
* **OpenAPI Agreement Type Validation:** Assert that the sign transaction matches the required parameters of the generated backend client.

### Manual Verification
* Navigate the wizard, input mock income/expense figures, verify that the quote displays the backend-approved limit correctly, draw a signature on the pad, confirm the OTP, and verify that the facility dashboard launches.
