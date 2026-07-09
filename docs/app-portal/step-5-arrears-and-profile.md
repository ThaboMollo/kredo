# Step 5 — Settings, Consents & Humane Arrears UI

This step implements the Profile Settings controls, POPIA Data Privacy workflows (consent withdrawals and DSAR data downloads), and a humane, transparent arrears resolution interface.

---

## 🎯 Objectives
* Build the Profile Settings and Passkey Security management interface.
* Implement the POPIA Consent Management portal (enabling direct consent revocation).
* Build the Data Subject Access Request (DSAR) personal data download tool.
* Design a humane Arrears Dashboard offering flexible payment restructuring and grace period requests.
* Render the Complaints, Disputes, and Credit Ombud escalation documentation.

---

## 🔨 Tasks & Sub-Tasks

### 1. Profile Security & Passkeys
- [ ] Create `ProfileComponent` showing registration details (university, encrypted FICA validation info).
- [ ] Implement Passkey Registration controls:
  * Expose an option to register a biometric device/passkey using WebAuthn browser APIs.
  * Store credentials on the backend for step-up authentication.

### 2. POPIA Privacy Portal (DSAR & Consents)
- [ ] Build the **Consent Manager Screen**:
  * Display a list of current active consents (e.g. `MARKETING`, `BUREAU_ENQUIRY`).
  * Add toggle controls: toggling "off" triggers a warning dialog ("Withdrawing this consent will restrict your access to future drawdowns") and submits a `WITHDRAWN` event to the backend consent ledger on confirmation.
- [ ] Build the **DSAR Download Utility**:
  * Add a button: "Download My Personal Data."
  * Calls backend `/api/v1/consumers/me/data-export` and saves the compiled personal history file locally as a structured JSON file.

### 3. Humane Arrears Dashboard
- [ ] Implement an `ArrearsDashboardComponent` that activates if the API returns an overdue flag.
- [ ] Enforce a supportive, transparent design:
  * Display a calm alert box: "We understand that student life has financial ups and downs. Let's resolve this together."
  * Output timeline details: "Your next bureau reporting deadline is [Date]. Repaying or choosing an option below keeps your credit history clean."
- [ ] Provide three interactive options:
  * **Option 1: Pay Outstanding Amount** (direct trigger to PSP widget).
  * **Option 2: Request Grace Extension** (extends repayment due date by 7 days; limited to once per calendar year).
  * **Option 3: Restructure Debt** (splits the outstanding balance into 3 smaller weekly installments; calls API to update ledger collections).

### 4. Complaints & Disputes Channel
- [ ] Create a customer support sub-view listing options to lodge a formal dispute regarding bureau reporting errors.
- [ ] Display contact information for the National Credit Regulator (NCR) and the Credit Ombud, including step-by-step escalation instructions.

---

## 🏛️ Code Structure Draft (DSAR Download Hook)

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dsar-download',
  template: `
    <div class="p-4 border rounded bg-white">
      <h4 class="font-semibold">Request Personal Data</h4>
      <p class="text-xs text-slate-500 mb-4">Download a copy of the personal information stored in our databases.</p>
      <button (click)="downloadData()" class="bg-slate-800 text-white px-4 py-2 rounded text-sm">
        Request JSON Export
      </button>
    </div>
  `
})
export class DsarDownloadComponent {
  private http = inject(HttpClient);

  downloadData() {
    this.http.get('/api/v1/consumers/me/data-export', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kredo-my-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Consent Revocation Warning Test:** Toggle the Bureau Enquiry consent off in test scripts, and verify that the confirmation warning popup renders and blocks execution until confirmed.
* **DSAR Export Format Test:** Trigger the data export function and assert that the returned JSON contains expected structural fields: consumer info, consent logs, and ledger entries.
* **Arrears Resolution Form Action:** Verify that selecting the restructuring option updates the UI state immediately and submits the correct payload parameters to the backend.

### Manual Verification
* Trigger an arrears state in the sandbox backend, access the dashboard, verify the warm notification box renders, choose "Request Grace Extension," and confirm that the repayment deadline updates.
