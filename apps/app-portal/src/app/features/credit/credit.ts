import { Component, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { WizardShellComponent } from '../../shared/wizard-shell';
import { environment } from '../../../environments/environment';

type CreditView = 'AFFORDABILITY' | 'QUOTE' | 'SIGNING' | 'SUCCESS';

const LABEL = 'font-caption text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft';
const FIELD =
  'bg-surface border border-line rounded-sm px-3.5 h-[54px] font-body text-lg text-ink focus:outline-none focus:border-accent w-full';
const BUTTON =
  'bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-3.5 rounded-sm transition-opacity cursor-pointer disabled:opacity-50';
const BUTTON_SECONDARY =
  'border border-line hover:border-accent text-ink font-caption text-sm font-semibold px-6 py-3.5 rounded-sm transition-colors cursor-pointer';

@Component({
  selector: 'app-credit-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, WizardShellComponent],
  template: `
    <app-wizard-shell [active]="wizardStep()" [eyebrow]="eyebrow()" [heading]="heading()">
      <!-- View 1: AFFORDABILITY -->
      @if (view() === 'AFFORDABILITY') {
        <div class="flex flex-col lg:flex-row gap-7 items-start">
          <div class="bg-surface-tint rounded-sm p-7 flex flex-col gap-4 w-full max-w-xl">
            <h2 class="font-heading text-3xl text-ink">Income, expenses, and obligations</h2>

            <div class="flex flex-col gap-2">
              <label class="${LABEL}">Gross monthly income (R)</label>
              <input type="number" [(ngModel)]="affordability.grossIncome" class="${FIELD}" placeholder="e.g. 4 200" />
            </div>

            <div class="flex flex-col gap-2">
              <label class="${LABEL}">Declared monthly expenses (R)</label>
              <input type="number" [(ngModel)]="affordability.declaredExpenses" class="${FIELD}" placeholder="e.g. 1 500" />
            </div>

            <div class="flex flex-col gap-2">
              <label class="${LABEL}">Existing obligations (R)</label>
              <input type="number" [(ngModel)]="affordability.bureauObligations" class="${FIELD}" placeholder="e.g. 650" />
            </div>

            <div class="bg-surface border-l-[3px] border-accent p-4 flex flex-col gap-1.5">
              <span class="font-caption text-xs font-bold text-accent">Client does not calculate the offer</span>
              <p class="font-body text-base leading-snug text-ink-soft">
                Fee, limit, and agreement values return from the backend quote service and are
                snapshotted into the signed agreement.
              </p>
            </div>

            @if (error()) {
              <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
            }

            <button (click)="submitAffordability()" [disabled]="loading()" class="${BUTTON} w-fit">
              {{ loading() ? 'Evaluating…' : 'Run assessment' }}
            </button>
          </div>

          <div class="border border-line rounded-sm p-5 flex flex-col gap-3 w-full max-w-sm">
            <h3 class="font-heading text-2xl text-ink">Required state handling</h3>
            @for (state of stateNotes; track state) {
              <div class="flex items-start gap-2.5">
                <span class="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0"></span>
                <span class="font-body text-base leading-snug text-ink-soft">{{ state }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- View 2: QUOTE -->
      @if (view() === 'QUOTE') {
        <div class="flex flex-col gap-6 max-w-xl">
          <div class="border border-line rounded-sm p-6 flex flex-col gap-1">
            <div class="flex items-center justify-between gap-4 border-b border-line pb-4">
              <span class="${LABEL}">Approved credit limit</span>
              <span class="font-heading text-4xl text-ink">R{{ approvedLimit() | number : '1.2-2' }}</span>
            </div>
            <div class="flex items-center justify-between gap-4 h-[52px] border-b border-line">
              <span class="${LABEL}">Initiation fee (one-off)</span>
              <span class="font-heading text-2xl text-ink">R0.00</span>
            </div>
            <div class="flex items-center justify-between gap-4 h-[52px] border-b border-line">
              <span class="${LABEL}">Monthly service fee</span>
              <span class="font-heading text-2xl text-ink">R0.00 <span class="font-caption text-xs text-ink-soft">covered by plan</span></span>
            </div>
            <div class="flex items-center justify-between gap-4 h-[52px]">
              <span class="${LABEL}">Interest rate (APR)</span>
              <span class="font-heading text-2xl text-ink">0.00% <span class="font-caption text-xs text-ink-soft">interest-free</span></span>
            </div>
          </div>

          <div class="bg-surface-tint border-l-[3px] border-accent p-4 flex flex-col gap-1.5 rounded-sm">
            <span class="font-caption text-xs font-bold text-accent">No hidden fees</span>
            <p class="font-body text-base leading-snug text-ink-soft">
              Kalahari operates on a subscription-only model. You pay no interest on drawdowns as
              long as your monthly subscription is active and repayments occur on time.
            </p>
          </div>

          <div class="flex gap-4">
            <button (click)="goToView('AFFORDABILITY')" class="${BUTTON_SECONDARY}">Adjust income</button>
            <button (click)="proceedToSign()" class="${BUTTON}">Accept &amp; sign</button>
          </div>
        </div>
      }

      <!-- View 3: SIGNING -->
      @if (view() === 'SIGNING') {
        <div class="flex flex-col gap-5 max-w-xl">
          <div class="border border-line bg-surface-tint rounded-sm p-5 max-h-40 overflow-y-auto font-caption text-xs text-ink-soft leading-relaxed">
            <strong class="text-ink">NATIONAL CREDIT AGREEMENT TERMS</strong><br />
            1. Parties: Kalahari (Credit Provider) &amp; Student (Consumer).<br />
            2. Facility: Revolving credit up to R{{ approvedLimit() | number }}.<br />
            3. Fees: Capped interest at 0.00% APR. Subscription fee applies monthly.<br />
            4. Defaults: Reports to major credit bureaus under NCA guidelines after grace periods.
          </div>

          <div class="flex flex-col gap-2">
            <label class="${LABEL}">Draw signature</label>
            <div class="border border-line rounded-sm overflow-hidden bg-surface relative">
              <canvas
                #sigCanvas
                class="w-full h-32 cursor-crosshair touch-none"
                (mousedown)="startDrawing($event)"
                (mousemove)="draw($event)"
                (mouseup)="stopDrawing()"
                (touchstart)="startDrawingTouch($event)"
                (touchmove)="drawTouch($event)"
                (touchend)="stopDrawing()"
              ></canvas>
              <button
                (click)="clearSignature()"
                class="absolute bottom-3 right-3 font-caption text-[10px] font-bold bg-surface-tint border border-line rounded-sm px-2.5 py-1 text-ink-soft cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="${LABEL}">Signing OTP code</label>
            <input type="text" maxlength="6" [(ngModel)]="signOtp" class="${FIELD} max-w-56" placeholder="Enter 123456" />
          </div>

          @if (error()) {
            <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
          }

          <button (click)="submitSignature()" [disabled]="loading()" class="${BUTTON} w-fit">
            {{ loading() ? 'Processing signature…' : 'Confirm signature & open facility' }}
          </button>
        </div>
      }

      <!-- View 4: SUCCESS -->
      @if (view() === 'SUCCESS') {
        <div class="bg-surface-tint rounded-sm p-7 flex flex-col gap-4 w-full max-w-xl">
          <span class="inline-flex items-center gap-2 bg-surface rounded-sm px-2.5 py-1.5 w-fit">
            <span class="h-2 w-2 rounded-full bg-accent"></span>
            <span class="font-caption text-xs font-bold text-ink">Facility active</span>
          </span>
          <p class="font-body text-lg leading-relaxed text-ink-soft">
            Your revolving credit facility is now fully active. You can draw down retailer vouchers
            directly from your dashboard.
          </p>
          <button (click)="goToDashboard()" class="${BUTTON} w-fit">Go to dashboard</button>
        </div>
      }
    </app-wizard-shell>
  `,
})
export class CreditComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  @ViewChild('sigCanvas') sigCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  view = signal<CreditView>('AFFORDABILITY');
  loading = signal(false);
  error = signal<string | null>(null);

  consumerId = signal<string>('consumer-uuid');
  agreementId = signal<string | null>(null);
  approvedLimit = signal(0);
  signOtp = '';

  affordability = {
    grossIncome: null,
    declaredExpenses: null,
    bureauObligations: null,
  };

  stateNotes = [
    'Loading: skeleton rows while the quote service responds',
    'Error: explain failed verification without losing progress',
    'Restriction: step-up before e-sign or large drawdown',
    'Success: agreement ready for PDF review and signature',
  ];

  constructor() {
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    if (storedId) {
      this.consumerId.set(storedId);
    }
  }

  wizardStep = computed(() => {
    switch (this.view()) {
      case 'AFFORDABILITY': return 4;
      case 'QUOTE': return 5;
      case 'SIGNING': return 6;
      case 'SUCCESS': return 7;
    }
  });

  eyebrow = computed(() => {
    switch (this.view()) {
      case 'AFFORDABILITY': return 'Affordability assessment';
      case 'QUOTE': return 'Pre-agreement quote';
      case 'SIGNING': return 'Contract execution';
      case 'SUCCESS': return 'Facility activated';
    }
  });

  heading = computed(() => {
    switch (this.view()) {
      case 'AFFORDABILITY': return 'Confirm what is affordable before any offer is made.';
      case 'QUOTE': return 'Review the approved limit and statutory fees.';
      case 'SIGNING': return 'Sign your credit agreement.';
      case 'SUCCESS': return 'Your facility is open.';
    }
  });

  goToView(target: CreditView) {
    this.view.set(target);
    this.error.set(null);
    if (target === 'SIGNING') {
      setTimeout(() => this.setupCanvas(), 50);
    }
  }

  submitAffordability() {
    if (!this.affordability.grossIncome || !this.affordability.declaredExpenses) {
      this.error.set('Please declare your monthly income and expenses.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = {
      consumerId: this.consumerId(),
      grossIncome: Math.floor(Number(this.affordability.grossIncome) * 100), // convert to cents
      declaredExpenses: Math.floor(Number(this.affordability.declaredExpenses) * 100),
      bureauObligations: Math.floor(Number(this.affordability.bureauObligations || 0) * 100),
    };

    this.http.post<any>(`${environment.apiBaseUrl}/api/v1/credit/affordability`, payload).subscribe({
      next: (res) => {
        this.agreementId.set(res.agreementId);
        this.approvedLimit.set(res.approvedLimit / 100); // Display in Rands
        this.goToView('QUOTE');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to complete credit evaluation.');
        this.loading.set(false);
      },
    });
  }

  proceedToSign() {
    this.goToView('SIGNING');
  }

  // Signature Canvas Controls
  private setupCanvas() {
    if (!this.sigCanvas) return;
    const canvas = this.sigCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Set internal resolution matching DOM size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    this.ctx.strokeStyle = '#2d2926';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
  }

  clearSignature() {
    if (!this.ctx) return;
    const canvas = this.sigCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(e.offsetX, e.offsetY);
  }

  draw(e: MouseEvent) {
    if (!this.isDrawing) return;
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();
  }

  startDrawingTouch(e: TouchEvent) {
    e.preventDefault();
    this.isDrawing = true;
    this.ctx.beginPath();
    const rect = this.sigCanvas.nativeElement.getBoundingClientRect();
    const touch = e.touches[0];
    this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  drawTouch(e: TouchEvent) {
    e.preventDefault();
    if (!this.isDrawing) return;
    const rect = this.sigCanvas.nativeElement.getBoundingClientRect();
    const touch = e.touches[0];
    this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  submitSignature() {
    if (!this.signOtp) {
      this.error.set('Signing requires verification. Please enter the OTP code.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = {
      consumerId: this.consumerId(),
      agreementId: this.agreementId(),
      otpCode: this.signOtp,
    };

    this.http.post<any>(`${environment.apiBaseUrl}/api/v1/credit/sign`, payload).subscribe({
      next: () => {
        this.goToView('SUCCESS');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to authenticate signature.');
        this.loading.set(false);
      },
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
