import { Component, ElementRef, ViewChild, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributionService } from '../../core/services/attribution.service';
import { WizardShellComponent } from '../../shared/wizard-shell';
import { environment } from '../../../environments/environment';

type OnboardingStep = 'REGISTER' | 'OTP' | 'FICA' | 'STUDENT' | 'SUCCESS';

const LABEL = 'font-caption text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft';
const FIELD =
  'bg-surface border border-line rounded-sm px-3.5 h-[54px] font-body text-lg text-ink focus:outline-none focus:border-accent w-full';
const BUTTON =
  'bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-3.5 rounded-sm transition-opacity cursor-pointer disabled:opacity-50';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, WizardShellComponent],
  template: `
    <app-wizard-shell [active]="wizardStep()" [eyebrow]="eyebrow()" [heading]="heading()">
      <!-- Step 1: REGISTER -->
      @if (step() === 'REGISTER') {
        <div class="flex flex-col lg:flex-row gap-7 items-start">
          <div class="bg-surface-tint rounded-sm p-7 flex flex-col gap-4 w-full max-w-2xl">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="${LABEL}">First name</label>
                <input type="text" [(ngModel)]="form.firstName" class="${FIELD}" placeholder="Lerato" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="${LABEL}">Last name</label>
                <input type="text" [(ngModel)]="form.lastName" class="${FIELD}" placeholder="Mokoena" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="${LABEL}">Email address</label>
              <input type="email" [(ngModel)]="form.email" class="${FIELD}" placeholder="student@university.ac.za" />
            </div>

            <div class="flex flex-col gap-2">
              <label class="${LABEL}">Mobile number</label>
              <input type="tel" [(ngModel)]="form.mobile" class="${FIELD}" placeholder="082 123 4567" />
            </div>

            <div class="flex flex-col gap-2">
              <label class="${LABEL}">SA ID number</label>
              <input type="text" [(ngModel)]="form.idNumber" class="${FIELD}" placeholder="0101015000081" />
            </div>

            <div class="bg-surface border-l-[3px] border-accent p-4 flex flex-col gap-2.5">
              <span class="font-caption text-xs font-bold text-accent">POPIA consent — no consent, no processing</span>
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="form.processingConsent" class="mt-1 h-4 w-4 accent-[#7d6b3d]" />
                <span class="font-body text-base text-ink-soft leading-snug">
                  I consent to Kredo processing my details for credit matching. (Required)
                </span>
              </label>
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="form.bureauConsent" class="mt-1 h-4 w-4 accent-[#7d6b3d]" />
                <span class="font-body text-base text-ink-soft leading-snug">
                  I authorise Kredo to perform a credit check and report payment behaviour to credit bureaus. (Required)
                </span>
              </label>
            </div>

            @if (error()) {
              <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
            }

            <button (click)="submitRegister()" [disabled]="loading()" class="${BUTTON} w-fit">
              {{ loading() ? 'Saving…' : 'Continue to verification' }}
            </button>
          </div>

          <div class="border border-line rounded-sm p-5 flex flex-col gap-3 w-full max-w-sm">
            <span class="font-heading text-2xl text-ink">Why we ask</span>
            <p class="font-body text-base leading-relaxed text-ink-soft">
              Consent is recorded with a timestamped audit trail before any processing happens.
              You can withdraw consent at any time from your profile.
            </p>
          </div>
        </div>
      }

      <!-- Step 2: OTP -->
      @if (step() === 'OTP') {
        <div class="bg-surface-tint rounded-sm p-7 flex flex-col gap-4 w-full max-w-xl">
          <p class="font-body text-lg text-ink-soft">
            We sent a 6-digit verification code to <strong class="text-ink">{{ form.email }}</strong>.
          </p>
          <div class="flex flex-col gap-2">
            <label class="${LABEL}">One-time PIN</label>
            <input
              type="text"
              maxlength="6"
              [(ngModel)]="otpCode"
              class="${FIELD} tracking-[0.5em] text-center max-w-56"
              placeholder="123456"
            />
          </div>
          <p class="font-caption text-xs text-ink-soft">For sandbox testing, enter <strong class="text-accent">123456</strong></p>
          @if (error()) {
            <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
          }
          <button (click)="submitOtp()" [disabled]="loading()" class="${BUTTON} w-fit">Verify code</button>
        </div>
      }

      <!-- Step 3: FICA -->
      @if (step() === 'FICA') {
        <div class="flex flex-col gap-5 w-full max-w-2xl">
          <p class="font-body text-lg text-ink-soft max-w-xl">
            Place your face in the oval boundary below to complete the liveness capture.
          </p>

          <div class="relative w-full aspect-video bg-ink rounded-sm overflow-hidden border border-line flex items-center justify-center">
            <video #videoElement autoplay playsinline class="w-full h-full object-cover" [class.hidden]="cameraDenied()"></video>

            @if (!cameraDenied() && cameraActive()) {
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-48 h-60 rounded-[50%] border-2 border-dashed border-cream/70 shadow-[0_0_0_9999px_rgba(45,41,38,0.55)]"></div>
              </div>
            }

            @if (cameraDenied()) {
              <div class="p-6 text-center text-cream/70 flex flex-col items-center gap-4">
                <p class="font-body text-base max-w-sm">
                  Camera access was denied. Upload a clear photo of your SA ID document and a selfie instead.
                </p>
                <input
                  type="file"
                  (change)="handleFicaDocUpload($event)"
                  class="font-caption text-xs text-cream/70 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:font-caption file:text-xs file:font-semibold file:bg-accent file:text-cream cursor-pointer"
                />
              </div>
            }

            @if (verifyingLiveness()) {
              <div class="absolute inset-0 bg-ink/90 flex flex-col items-center justify-center text-cream gap-4">
                <div class="h-10 w-10 border-4 border-cream/20 border-t-accent animate-spin rounded-full"></div>
                <p class="font-caption text-sm font-semibold">Running liveness matching…</p>
              </div>
            }
          </div>

          @if (error()) {
            <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
          }

          <div class="flex gap-4">
            @if (!cameraDenied() && !cameraActive()) {
              <button (click)="initCamera()" class="${BUTTON}">Enable web camera</button>
            }
            @if (cameraActive() && !verifyingLiveness()) {
              <button (click)="captureSelfie()" class="${BUTTON}">Capture &amp; verify</button>
            }
            @if (cameraDenied() && mockFileUploaded) {
              <button (click)="submitManualKyc()" class="${BUTTON}">Submit KYC documents</button>
            }
          </div>
        </div>
      }

      <!-- Step 4: STUDENT -->
      @if (step() === 'STUDENT') {
        <div class="flex flex-col gap-5 w-full max-w-2xl">
          <p class="font-body text-lg text-ink-soft max-w-xl">
            We require proof of student registration before a credit facility can be offered.
          </p>

          <div class="bg-surface-tint rounded-sm p-6 flex flex-col gap-3">
            <span class="${LABEL}">Method A — instant email match</span>
            <p class="font-body text-base text-ink-soft">
              Enter your official university address (ending in .ac.za) to auto-verify.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <input type="email" [(ngModel)]="studentEmail" class="${FIELD} flex-1" placeholder="you@university.ac.za" />
              <button (click)="submitStudentEmail()" class="${BUTTON}">Verify</button>
            </div>
          </div>

          <div class="border border-line rounded-sm p-6 flex flex-col gap-3">
            <span class="${LABEL}">Method B — manual document review</span>
            <p class="font-body text-base text-ink-soft">
              Upload your student card or registration letter if email verification is not available.
            </p>
            <input
              type="file"
              (change)="handleStudentCardUpload($event)"
              class="font-caption text-xs text-ink-soft file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:font-caption file:text-xs file:font-semibold file:bg-surface-tint file:text-accent cursor-pointer"
            />
            @if (studentCardFile) {
              <button (click)="submitStudentCard()" class="${BUTTON} w-fit">Upload document</button>
            }
          </div>

          @if (error()) {
            <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
          }
        </div>
      }

      <!-- Step 5: SUCCESS -->
      @if (step() === 'SUCCESS') {
        <div class="bg-surface-tint rounded-sm p-7 flex flex-col gap-4 w-full max-w-xl">
          <span class="inline-flex items-center gap-2 bg-surface rounded-sm px-2.5 py-1.5 w-fit">
            <span class="h-2 w-2 rounded-full bg-accent"></span>
            <span class="font-caption text-xs font-bold text-ink">KYC verified</span>
          </span>
          <p class="font-body text-lg leading-relaxed text-ink-soft">
            Your profile has been created, identity verified, and academic enrollment confirmed.
            Next, choose a subscription plan and set up your DebiCheck mandate.
          </p>
          <button (click)="finishOnboarding()" class="${BUTTON} w-fit">Select subscription plan</button>
        </div>
      }
    </app-wizard-shell>
  `,
})
export class OnboardingComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private attributionService = inject(AttributionService);

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  step = signal<OnboardingStep>('REGISTER');
  loading = signal(false);
  error = signal<string | null>(null);
  consumerId = signal<string | null>(null);

  // Form State
  form = {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    idNumber: '',
    processingConsent: false,
    bureauConsent: false,
  };

  otpCode = '';
  studentEmail = '';
  studentCardFile: File | null = null;
  mockFileUploaded = false;

  // Camera liveness state
  cameraActive = signal(false);
  cameraDenied = signal(false);
  verifyingLiveness = signal(false);
  private stream: MediaStream | null = null;

  constructor() {
    // Capture URL Query Params
    this.route.queryParams.subscribe((params) => {
      this.attributionService.captureAttribution(params);
    });

    // Handle camera stream cleanup
    effect((onCleanup) => {
      onCleanup(() => this.stopCamera());
    });
  }

  wizardStep = computed(() => (this.step() === 'REGISTER' || this.step() === 'OTP' ? 1 : 2));

  eyebrow = computed(() => {
    switch (this.step()) {
      case 'REGISTER': return 'POPIA consent';
      case 'OTP': return 'Verification';
      case 'FICA': return 'KYC / FICA';
      case 'STUDENT': return 'Student status';
      case 'SUCCESS': return 'Verified';
    }
  });

  heading = computed(() => {
    switch (this.step()) {
      case 'REGISTER': return 'Create your Kredo profile.';
      case 'OTP': return 'Confirm your contact details.';
      case 'FICA': return 'Verify your identity.';
      case 'STUDENT': return 'Confirm your enrollment.';
      case 'SUCCESS': return 'Identity confirmed.';
    }
  });

  // Actions
  async submitRegister() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.idNumber) {
      this.error.set('Please fill out all mandatory fields.');
      return;
    }
    if (!this.form.processingConsent || !this.form.bureauConsent) {
      this.error.set('You must grant the required POPIA consents to proceed.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const attribution = this.attributionService.getAttribution();
    const payload = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      mobile: this.form.mobile,
      idNumber: this.form.idNumber,
      ...attribution,
    };

    this.http.post<any>(`${environment.apiBaseUrl}/api/v1/consumers`, payload).subscribe({
      next: (res) => {
        this.consumerId.set(res.id);
        sessionStorage.setItem('kredo_consumer_id', res.id);
        this.logConsent(res.id, 'PROCESSING', 'GRANTED');
        this.logConsent(res.id, 'BUREAU_ENQUIRY', 'GRANTED');
        this.step.set('OTP');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to register account.');
        this.loading.set(false);
      },
    });
  }

  private logConsent(consumerId: string, consentType: string, status: 'GRANTED' | 'WITHDRAWN') {
    this.http.post(`${environment.apiBaseUrl}/api/v1/consumers/${consumerId}/consents`, {
      consentType,
      status,
      version: 'v1.0',
    }).subscribe();
  }

  submitOtp() {
    if (this.otpCode !== '123456') {
      this.error.set('Invalid OTP code. Please enter 123456 for the sandbox test.');
      return;
    }
    this.error.set(null);
    this.step.set('FICA');
  }

  // Camera Management
  async initCamera() {
    this.error.set(null);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.cameraActive.set(true);
      this.cameraDenied.set(false);
    } catch (err) {
      console.error('Camera access error:', err);
      this.cameraDenied.set(true);
      this.cameraActive.set(false);
    }
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.cameraActive.set(false);
  }

  captureSelfie() {
    this.verifyingLiveness.set(true);
    this.error.set(null);

    // Simulate liveness detection wait
    setTimeout(() => {
      this.stopCamera();
      this.http.post<any>(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}/kyc/fica`, {
        shouldSucceed: true,
      }).subscribe({
        next: () => {
          this.verifyingLiveness.set(false);
          this.step.set('STUDENT');
        },
        error: (err) => {
          this.error.set(err.error?.message || 'KYC FICA verification failed.');
          this.verifyingLiveness.set(false);
        },
      });
    }, 2000);
  }

  handleFicaDocUpload(event: Event) {
    this.mockFileUploaded = true;
  }

  submitManualKyc() {
    this.loading.set(true);
    this.http.post(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}/kyc/fica`, {
      shouldSucceed: true,
    }).subscribe({
      next: () => {
        this.step.set('STUDENT');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Manual document submission failed.');
        this.loading.set(false);
      },
    });
  }

  submitStudentEmail() {
    if (!this.studentEmail || !this.studentEmail.endsWith('.ac.za')) {
      this.error.set('Please enter a valid South African academic email ending in .ac.za');
      return;
    }

    this.error.set(null);
    this.http.post(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}/student-verify`, {
      academicEmail: this.studentEmail,
    }).subscribe({
      next: () => {
        this.step.set('SUCCESS');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Academic email verification failed.');
      },
    });
  }

  handleStudentCardUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.studentCardFile = input.files[0];
    }
  }

  submitStudentCard() {
    this.error.set(null);
    this.http.post(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}/student-verify`, {
      studentCardDocUrl: 'https://storage.kalahari.co.za/student-cards/card-mock.pdf',
    }).subscribe({
      next: () => {
        this.step.set('SUCCESS');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Document upload failed.');
      },
    });
  }

  finishOnboarding() {
    // Navigate to subscriber tier selection in Step 2
    this.router.navigate(['/subscribe']);
  }
}
