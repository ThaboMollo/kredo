import { Component, ElementRef, ViewChild, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributionService } from '../../core/services/attribution.service';

type OnboardingStep = 'REGISTER' | 'OTP' | 'FICA' | 'STUDENT' | 'SUCCESS';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-6 antialiased">
      <!-- Onboarding Container -->
      <div class="bg-white/80 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-3xl w-full max-w-xl p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden">
        
        <!-- Background decorative blur -->
        <div class="absolute -top-24 -right-24 h-48 w-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Step Indicator -->
        <div class="flex items-center justify-between text-xs font-semibold text-stone-400 uppercase tracking-wider">
          <span>{{ currentStepTitle() }}</span>
          <span>Step {{ currentStepIndex() }} of 4</span>
        </div>
        <div class="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
          <div class="bg-primary h-full transition-all duration-300" [style.width.%]="progressPercentage()"></div>
        </div>

        <!-- Step 1: REGISTER -->
        <div *ngIf="step() === 'REGISTER'" class="flex flex-col gap-4">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight">Create your Kredo Profile</h2>
            <p class="text-sm text-stone-500 mt-1">Get started on your credit-building journey.</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-stone-500">First Name</label>
              <input type="text" [(ngModel)]="form.firstName" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="Thabo" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-stone-500">Last Name</label>
              <input type="text" [(ngModel)]="form.lastName" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="Mollo" />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">Email Address</label>
            <input type="email" [(ngModel)]="form.email" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="student@university.ac.za" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">Mobile Number</label>
            <input type="tel" [(ngModel)]="form.mobile" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="082 123 4567" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">SA ID Number</label>
            <input type="text" [(ngModel)]="form.idNumber" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="0101015000081" />
          </div>

          <!-- POPIA checks -->
          <div class="flex flex-col gap-3 mt-2 bg-stone-50 border border-stone-200/60 p-4 rounded-2xl">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="form.processingConsent" class="mt-1 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40" />
              <span class="text-xs text-stone-600 leading-normal">I consent to Kredo processing my details for credit matching. (Required) *</span>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" [(ngModel)]="form.bureauConsent" class="mt-1 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/40" />
              <span class="text-xs text-stone-600 leading-normal">I authorize Kredo to perform a credit check and report payment behaviors to credit bureaus. (Required) *</span>
            </label>
          </div>

          <p *ngIf="error()" class="text-xs text-red-600 font-semibold mt-1">{{ error() }}</p>

          <button (click)="submitRegister()" [disabled]="loading()" class="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer">
            {{ loading() ? 'Saving...' : 'Continue to OTP Verification' }}
          </button>
        </div>

        <!-- Step 2: OTP -->
        <div *ngIf="step() === 'OTP'" class="flex flex-col gap-5 text-center">
          <div class="flex flex-col gap-2">
            <h2 class="text-3xl font-extrabold tracking-tight">Enter OTP</h2>
            <p class="text-sm text-stone-500">We sent a 6-digit verification code to {{ form.email }}</p>
          </div>

          <div class="flex justify-center gap-2 my-2">
            <input type="text" maxlength="6" [(ngModel)]="otpCode" class="border border-stone-300 rounded-xl p-3 text-center text-xl font-bold tracking-[0.5em] w-48 focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="123456" />
          </div>

          <p class="text-xs text-stone-400">For mock testing, enter <strong class="text-primary">123456</strong></p>
          <p *ngIf="error()" class="text-xs text-red-600 font-semibold">{{ error() }}</p>

          <button (click)="submitOtp()" [disabled]="loading()" class="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl transition-all shadow-md cursor-pointer">
            Verify Code
          </button>
        </div>

        <!-- Step 3: FICA -->
        <div *ngIf="step() === 'FICA'" class="flex flex-col gap-5">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight">Identity (FICA) Verification</h2>
            <p class="text-sm text-stone-500 mt-1">Place your face in the oval boundary below to complete liveness capture.</p>
          </div>

          <!-- Camera Stream Frame -->
          <div class="relative w-full aspect-video bg-stone-900 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-inner flex items-center justify-center">
            <video #videoElement autoplay playsinline class="w-full h-full object-cover" [class.hidden]="cameraDenied()"></video>
            
            <!-- Face boundary overlay -->
            <div *ngIf="!cameraDenied() && cameraActive()" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-48 h-60 rounded-[50%] border-4 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
            </div>

            <!-- Fallback Document Upload -->
            <div *ngIf="cameraDenied()" class="p-6 text-center text-stone-400 flex flex-col items-center gap-4">
              <span class="text-4xl">📷</span>
              <p class="text-sm">Camera access was denied. Please upload a clear photo of your SA ID Document and a Selfie.</p>
              <input type="file" (change)="handleFicaDocUpload($event)" class="text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
            </div>

            <!-- Loading overlay during liveness check -->
            <div *ngIf="verifyingLiveness()" class="absolute inset-0 bg-stone-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
              <div class="h-10 w-10 border-4 border-t-primary animate-spin rounded-full"></div>
              <p class="text-sm font-semibold">Running liveness matching algorithms...</p>
            </div>
          </div>

          <p *ngIf="error()" class="text-xs text-red-600 font-semibold text-center">{{ error() }}</p>

          <div class="flex gap-4">
            <button *ngIf="!cameraDenied() && !cameraActive()" (click)="initCamera()" class="flex-1 bg-stone-850 hover:bg-stone-900 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer">
              Enable Web Camera
            </button>
            <button *ngIf="cameraActive() && !verifyingLiveness()" (click)="captureSelfie()" class="flex-1 bg-primary hover:bg-primary/95 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer">
              Capture & Verify
            </button>
            <button *ngIf="cameraDenied() && mockFileUploaded" (click)="submitManualKyc()" class="flex-1 bg-primary hover:bg-primary/95 text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer">
              Submit KYC Documents
            </button>
          </div>
        </div>

        <!-- Step 4: STUDENT -->
        <div *ngIf="step() === 'STUDENT'" class="flex flex-col gap-5">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight">Academic Enrollment</h2>
            <p class="text-sm text-stone-500 mt-1">We require proof of student registration to unlock credit facility offers.</p>
          </div>

          <div class="flex flex-col gap-4">
            <!-- Academic Email -->
            <div class="flex flex-col gap-1 bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <span class="text-xs font-bold text-stone-500">Method A: Instant Email Match</span>
              <p class="text-xs text-stone-400 mb-2">Input your official university address (e.g. .ac.za) to auto-verify.</p>
              <div class="flex gap-2">
                <input type="email" [(ngModel)]="studentEmail" class="flex-1 border border-stone-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="you@university.ac.za" />
                <button (click)="submitStudentEmail()" class="bg-stone-850 hover:bg-stone-900 text-white text-xs font-bold px-4 rounded-xl cursor-pointer">Verify</button>
              </div>
            </div>

            <!-- Manual File Fallback -->
            <div class="flex flex-col gap-1 bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <span class="text-xs font-bold text-stone-500">Method B: Manual Document Review</span>
              <p class="text-xs text-stone-400 mb-3">Upload your student card or registration letter if email verification is not available.</p>
              <input type="file" (change)="handleStudentCardUpload($event)" class="text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              <button *ngIf="studentCardFile" (click)="submitStudentCard()" class="bg-primary hover:bg-primary/95 text-white text-xs font-bold py-2.5 rounded-xl mt-3 cursor-pointer">
                Upload Document
              </button>
            </div>
          </div>

          <p *ngIf="error()" class="text-xs text-red-600 font-semibold text-center">{{ error() }}</p>
        </div>

        <!-- Step 5: SUCCESS -->
        <div *ngIf="step() === 'SUCCESS'" class="flex flex-col gap-5 text-center py-6">
          <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-2 animate-bounce">✓</div>
          <h2 class="text-3xl font-extrabold tracking-tight">Onboarding Complete!</h2>
          <p class="text-stone-600 text-sm leading-relaxed max-w-xs mx-auto">
            Your profile has been created, identity verified, and academic enrollment confirmed. We're ready to proceed to subscription setup.
          </p>

          <button (click)="finishOnboarding()" class="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-4 cursor-pointer">
            Select Subscription Plan
          </button>
        </div>

      </div>
    </div>
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

  currentStepIndex = computed(() => {
    switch (this.step()) {
      case 'REGISTER': return 1;
      case 'OTP': return 2;
      case 'FICA': return 3;
      case 'STUDENT':
      case 'SUCCESS': return 4;
    }
  });

  currentStepTitle = computed(() => {
    switch (this.step()) {
      case 'REGISTER': return 'Profile Creation';
      case 'OTP': return 'Verification';
      case 'FICA': return 'FICA Compliance';
      case 'STUDENT': return 'Enrollment Verification';
      case 'SUCCESS': return 'All Set';
    }
  });

  progressPercentage = computed(() => (this.currentStepIndex() / 4) * 100);

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

    this.http.post<any>('http://localhost:3000/api/v1/consumers', payload).subscribe({
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
    this.http.post(`http://localhost:3000/api/v1/consumers/${consumerId}/consents`, {
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
      this.http.post<any>(`http://localhost:3000/api/v1/consumers/${this.consumerId()}/kyc/fica`, {
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
    this.http.post(`http://localhost:3000/api/v1/consumers/${this.consumerId()}/kyc/fica`, {
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
    this.http.post(`http://localhost:3000/api/v1/consumers/${this.consumerId()}/student-verify`, {
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
    this.http.post(`http://localhost:3000/api/v1/consumers/${this.consumerId()}/student-verify`, {
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
