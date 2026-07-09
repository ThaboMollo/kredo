# Step 1 — Onboarding, KYC & Student Verification UI

This step implements the student acquisition landing interface, dynamic POPIA consent forms, the camera-based liveness verification layout, and student status uploads.

---

## 🎯 Objectives
* Extract and persist inbound UTM and referrer marketing query parameters.
* Build the multi-step registration forms with granular POPIA consents.
* Integrate browser camera controls (`getUserMedia`) for ID/Selfie FICA verification.
* Build the student enrollment proof document uploader and verification tracking page.

---

## 🔨 Tasks & Sub-Tasks

### 1. Inbound Attribution Processing
- [ ] Implement an Angular router guard or root component hook that parses URL query parameters (`ref`, `utm_source`, etc.).
- [ ] Save parameters in the onboarding session state using an Angular Service or NgRx SignalStore.

### 2. Registration & Granular POPIA Wizard
- [ ] Build the registration UI:
  * Screen 1: Mobile number & Email submission.
  * Screen 2: OTP Verification input (6 digits).
- [ ] Implement the POPIA Consent screen:
  * Show clear, separate checkboxes for:
    1. Agreement to standard terms & data processing (Mandatory).
    2. Consent to run credit checks & report to bureaus (Mandatory).
    3. Consent to promotional marketing (Optional).
  * Prevent users from moving forward if mandatory checkboxes are left unchecked.
  * Send the consent payloads along with device metadata (IP, User-Agent) to the backend.

### 3. FICA Liveness Verification Interface
- [ ] Design the camera capture container:
  * Request permission to use the browser camera (`getUserMedia` API).
  * Render an oval boundary overlay directing the user to position their face.
  * Add error screens detailing what to do if the camera request is denied or if the device lacks a camera.
- [ ] Implement liveness processing:
  * Capture snapshots and transfer them to the KYC provider API.
  * Display a loading indicator during validation ("Verifying your identity...").
  * Build redirect routes for: `SUCCESS` -> Subscribe; `FAILED` -> Retry; `MANUAL_REVIEW` -> Show explanation.

### 4. Student Enrollment Verification
- [ ] Build the institutional email validation interface (user inputs student email, clicks verify, enters OTP sent to academic inbox).
- [ ] Build the document upload dashboard (for manual review):
  * Create a drag-and-drop file upload zone.
  * Set file type constraints (PDF, PNG, JPEG) and file size caps (max 5MB).
  * Render status badge cards displaying `PENDING`, `VERIFIED`, or `MANUAL_REVIEW`.

---

## 🏛️ Code Structure Draft (Camera Capture)

```typescript
import { Component, ElementRef, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-kyc-camera',
  template: `
    <div class="camera-container relative w-full max-w-md mx-auto">
      <video #videoElement autoplay playsinline class="w-full rounded-2xl border-4 border-slate-200"></video>
      <div class="oval-overlay absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="w-64 h-80 rounded-[50%] border-4 border-dashed border-white/60"></div>
      </div>
      @if (errorMessage()) {
        <p class="text-red-500 text-sm mt-2 text-center">{{ errorMessage() }}</p>
      }
    </div>
  `
})
export class KycCameraComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  errorMessage = signal<string | null>(null);

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      this.videoElement.nativeElement.srcObject = stream;
    } catch (err) {
      this.errorMessage.set('Could not access camera. Please check permissions.');
    }
  }
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **Attribution URL Parsing Test:** Mock router navigation with `?ref=AMB1`, and assert that the active SignalStore state updates to contain the referrer metadata.
* **POPIA Consent Guard Test:** Assert that the form submission function is disabled/inactive if any of the mandatory consent checkboxes are unchecked.
* **Camera Error Fallback Test:** Mock a browser environment where `mediaDevices` throws a denial error, and verify that the UI renders the manual document upload fallback view.

### Manual Verification
* Access the registration page on a mobile browser simulator, decline camera access, and verify the interface transitions gracefully to the document upload screen.
