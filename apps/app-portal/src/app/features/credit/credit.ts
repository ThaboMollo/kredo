import { Component, ElementRef, ViewChild, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

type CreditView = 'AFFORDABILITY' | 'QUOTE' | 'SIGNING' | 'SUCCESS';

@Component({
  selector: 'app-credit-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-6 antialiased">
      <div class="bg-white/80 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-3xl w-full max-w-xl p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden">
        
        <!-- Background decorative blur -->
        <div class="absolute -top-24 -right-24 h-48 w-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Progress Indicator -->
        <div *ngIf="view() !== 'SUCCESS'" class="flex items-center justify-between text-xs font-semibold text-stone-400 uppercase tracking-wider">
          <span>{{ currentStepTitle() }}</span>
          <span>Step {{ currentStepIndex() }} of 3</span>
        </div>
        <div *ngIf="view() !== 'SUCCESS'" class="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
          <div class="bg-primary h-full transition-all duration-300" [style.width.%]="progressPercentage()"></div>
        </div>

        <!-- View 1: AFFORDABILITY -->
        <div *ngIf="view() === 'AFFORDABILITY'" class="flex flex-col gap-4">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight">Affordability Assessment</h2>
            <p class="text-sm text-stone-500 mt-1">NCA s81 check. Please declare your monthly financial details.</p>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">Gross Monthly Income (R)</label>
            <input type="number" [(ngModel)]="affordability.grossIncome" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="e.g. 5000" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">Declared Monthly Expenses (R)</label>
            <input type="number" [(ngModel)]="affordability.declaredExpenses" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="e.g. 2000" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">Other Debt Obligations (R)</label>
            <input type="number" [(ngModel)]="affordability.bureauObligations" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="e.g. 500" />
          </div>

          <p *ngIf="error()" class="text-xs text-red-600 font-semibold mt-1">{{ error() }}</p>

          <button (click)="submitAffordability()" [disabled]="loading()" class="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-4 flex items-center justify-center cursor-pointer">
            {{ loading() ? 'Evaluating...' : 'Run Credit Assessment' }}
          </button>
        </div>

        <!-- View 2: QUOTE -->
        <div *ngIf="view() === 'QUOTE'" class="flex flex-col gap-5">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight text-stone-900">Pre-Agreement Quote</h2>
            <p class="text-sm text-stone-500 mt-1">Review the approved credit limit and statutory fee schedule.</p>
          </div>

          <div class="bg-stone-50 border border-stone-200/80 rounded-2xl p-6 flex flex-col gap-4">
            <div class="flex justify-between items-baseline border-b border-stone-200 pb-3">
              <span class="text-sm font-semibold text-stone-500">Approved Credit Limit</span>
              <span class="text-2xl font-black text-stone-950">R{{ approvedLimit() | number:'1.2-2' }}</span>
            </div>

            <div class="flex flex-col gap-2.5 text-xs text-stone-600">
              <div class="flex justify-between">
                <span>Initiation Fee (One-off)</span>
                <span>R0.00</span>
              </div>
              <div class="flex justify-between">
                <span>Monthly Service Fee</span>
                <span>R0.00 (Covered by plan)</span>
              </div>
              <div class="flex justify-between font-semibold text-stone-900">
                <span>Interest Rate (APR)</span>
                <span>0.00% (Interest-Free)</span>
              </div>
            </div>
          </div>

          <div class="text-xs text-stone-400 leading-relaxed bg-stone-100/50 p-4 rounded-xl border border-stone-200">
            * <strong>No Hidden Fees:</strong> Kalahari operates on a subscription-only model. You pay no interest on drawdowns as long as your monthly subscription is active and repayments occur on time.
          </div>

          <div class="flex gap-4 mt-2">
            <button (click)="goToView('AFFORDABILITY')" class="flex-1 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm">
              Adjust Income
            </button>
            <button (click)="proceedToSign()" class="flex-1 bg-primary hover:bg-primary/95 text-white font-bold py-3.5 rounded-xl transition-all shadow-md cursor-pointer text-sm">
              Accept & Sign
            </button>
          </div>
        </div>

        <!-- View 3: SIGNING -->
        <div *ngIf="view() === 'SIGNING'" class="flex flex-col gap-4">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight">Sign Credit Agreement</h2>
            <p class="text-sm text-stone-500 mt-1">Review the legal contract details and capture your digital signature.</p>
          </div>

          <!-- Document Box -->
          <div class="border border-stone-200 bg-stone-50 rounded-2xl p-4 max-h-36 overflow-y-auto text-[10px] text-stone-500 leading-relaxed font-mono">
            <strong>NATIONAL CREDIT AGREEMENT TERMS:</strong><br />
            1. Parties: Kalahari (Credit Provider) & Student (Consumer).<br />
            2. Facility: Revolving credit up to R{{ approvedLimit() | number }}.<br />
            3. Fees: Capped interest at 0.00% APR. Subscription fee applies monthly.<br />
            4. Defaults: Reports to major credit bureaus under NCA guidelines after grace periods.
          </div>

          <!-- Signature Pad Canvas -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-stone-500">Draw Signature *</label>
            <div class="border border-stone-300 rounded-2xl overflow-hidden bg-white relative">
              <canvas #sigCanvas class="w-full h-32 cursor-crosshair touch-none" (mousedown)="startDrawing($event)" (mousemove)="draw($event)" (mouseup)="stopDrawing()" (touchstart)="startDrawingTouch($event)" (touchmove)="drawTouch($event)" (touchend)="stopDrawing()"></canvas>
              <button (click)="clearSignature()" class="absolute bottom-3 right-3 text-[10px] bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded px-2.5 py-1 font-bold text-stone-600 transition-all cursor-pointer">
                Clear
              </button>
            </div>
          </div>

          <!-- OTP Input -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-stone-500">Signing OTP Code *</label>
            <div class="flex gap-2">
              <input type="text" maxlength="6" [(ngModel)]="signOtp" class="flex-1 border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="Enter 123456" />
            </div>
          </div>

          <p *ngIf="error()" class="text-xs text-red-600 font-semibold mt-1">{{ error() }}</p>

          <button (click)="submitSignature()" [disabled]="loading()" class="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer">
            {{ loading() ? 'Processing Signature...' : 'Confirm Signature & Open Facility' }}
          </button>
        </div>

        <!-- View 4: SUCCESS -->
        <div *ngIf="view() === 'SUCCESS'" class="flex flex-col gap-6 text-center py-6">
          <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-2 animate-bounce">✓</div>
          <h2 class="text-3xl font-extrabold tracking-tight">Facility Activated!</h2>
          <p class="text-stone-600 text-sm leading-relaxed max-w-xs mx-auto">
            Your revolving credit facility is now fully active. You can draw down retailer vouchers directly from your dashboard.
          </p>

          <button (click)="goToDashboard()" class="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-4 cursor-pointer">
            Go to Dashboard
          </button>
        </div>

      </div>
    </div>
  `,
})
export class CreditComponent implements AfterViewInit {
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

  constructor() {
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    if (storedId) {
      this.consumerId.set(storedId);
    }
  }

  ngAfterViewInit() {
    // Canvas setup deferred until View 3 is rendered.
    // We listen to view changes.
  }

  currentStepIndex = computed(() => {
    switch (this.view()) {
      case 'AFFORDABILITY': return 1;
      case 'QUOTE': return 2;
      case 'SIGNING':
      case 'SUCCESS': return 3;
    }
  });

  currentStepTitle = computed(() => {
    switch (this.view()) {
      case 'AFFORDABILITY': return 'Credit Score Assessment';
      case 'QUOTE': return 'Disclosure Pre-Agreement';
      case 'SIGNING': return 'Contract Execution';
      case 'SUCCESS': return 'Active';
    }
  });

  progressPercentage = computed(() => (this.currentStepIndex() / 3) * 100);

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
    this.ctx.strokeStyle = '#2d2522';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    
    // Set internal resolution matching DOM size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
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
