import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

type SubView = 'PLANS' | 'BANK' | 'WAITING';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-6 antialiased">
      <div class="bg-white/80 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-3xl w-full max-w-xl p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden">
        
        <!-- Background decorative blur -->
        <div class="absolute -top-24 -right-24 h-48 w-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- View 1: PLANS -->
        <div *ngIf="view() === 'PLANS'" class="flex flex-col gap-5">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight text-stone-900">Select a subscription plan</h2>
            <p class="text-sm text-stone-500 mt-1">Our facilities are interest-free. We only charge a fixed monthly subscription.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <!-- Basic Plan Card -->
            <div (click)="selectPlan('STUDENT_BASIC')" [class.border-primary]="selectedPlan() === 'STUDENT_BASIC'" class="bg-white border-2 border-stone-200 hover:border-primary rounded-2xl p-6 cursor-pointer flex flex-col gap-3 transition-all relative">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-widest">Basic</span>
              <div class="text-2xl font-bold text-stone-900">R59<span class="text-xs text-stone-400">/mo</span></div>
              <p class="text-xs text-stone-500">Includes a revolving retail credit facility limit of up to <strong>R1 500</strong>.</p>
            </div>

            <!-- Premium Plan Card -->
            <div (click)="selectPlan('STUDENT_PREMIUM')" [class.border-primary]="selectedPlan() === 'STUDENT_PREMIUM'" class="bg-white border-2 border-stone-200 hover:border-primary rounded-2xl p-6 cursor-pointer flex flex-col gap-3 transition-all relative">
              <span class="text-xs font-bold text-primary uppercase tracking-widest">Premium</span>
              <div class="text-2xl font-bold text-stone-900">R99<span class="text-xs text-stone-400">/mo</span></div>
              <p class="text-xs text-stone-500">Includes a revolving retail credit facility limit of up to <strong>R3 500</strong>.</p>
            </div>
          </div>

          <button (click)="proceedToBank()" [disabled]="!selectedPlan()" class="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-4 cursor-pointer disabled:opacity-50">
            Proceed to Payment Details
          </button>
        </div>

        <!-- View 2: BANK -->
        <div *ngIf="view() === 'BANK'" class="flex flex-col gap-4">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight text-stone-900">Configure DebiCheck</h2>
            <p class="text-sm text-stone-500 mt-1">Authenticate your debit order details to secure your monthly plan payments.</p>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">Select Bank</label>
            <select [(ngModel)]="bankDetails.bankCode" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white">
              <option value="">-- Choose Bank --</option>
              <option value="FNB">First National Bank (FNB)</option>
              <option value="StandardBank">Standard Bank</option>
              <option value="Capitec">Capitec</option>
              <option value="Nedbank">Nedbank</option>
              <option value="Absa">ABSA</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">Account Number</label>
            <input type="text" [(ngModel)]="bankDetails.accountNumber" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="e.g. 62123456789" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-stone-500">Branch Code</label>
            <input type="text" [(ngModel)]="bankDetails.branchCode" class="border border-stone-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="e.g. 250655" />
          </div>

          <p *ngIf="error()" class="text-xs text-red-600 font-semibold mt-1">{{ error() }}</p>

          <button (click)="submitDebiCheck()" [disabled]="loading()" class="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-4 flex items-center justify-center cursor-pointer">
            {{ loading() ? 'Initiating DebiCheck...' : 'Initialize Mandate' }}
          </button>
        </div>

        <!-- View 3: WAITING -->
        <div *ngIf="view() === 'WAITING'" class="flex flex-col gap-6 text-center py-4">
          <div class="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div class="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-t-primary animate-spin rounded-full"></div>
          </div>

          <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-extrabold tracking-tight">Approve Mandate</h2>
            <p class="text-sm text-stone-500">We initiated a DebiCheck request with reference <strong>{{ mandateRef() }}</strong></p>
          </div>

          <div class="bg-stone-50 border border-stone-200 p-6 rounded-2xl flex flex-col gap-3 text-left">
            <h4 class="text-xs font-bold text-stone-500 uppercase tracking-widest">How to approve:</h4>
            <ol class="text-xs text-stone-600 list-decimal list-inside flex flex-col gap-2 leading-relaxed">
              <li>Open your <strong>{{ bankDetails.bankCode }}</strong> banking application.</li>
              <li>Navigate to <strong>Debits / Mandates / DebiCheck</strong>.</li>
              <li>Review the details for Kalahari and click <strong>Approve</strong>.</li>
              <li>Or Dial your bank's USSD authentication code (e.g. *120*229#) if requested.</li>
            </ol>
          </div>

          <div class="text-xs text-stone-400 flex flex-col gap-1">
            <span>Waiting for your bank's approval confirmation...</span>
            <span class="text-[10px] text-stone-300">(Checks automatically every 5 seconds)</span>
          </div>

          <p *ngIf="error()" class="text-xs text-red-600 font-semibold">{{ error() }}</p>

          <!-- Mock simulation button for testing -->
          <button (click)="simulateMockApproval()" class="text-xs bg-stone-100 text-stone-600 hover:bg-stone-200 font-semibold py-2 px-4 rounded-xl border border-stone-300 mt-2 mx-auto cursor-pointer">
            Simulate Mandate Approval (Mock Sandbox)
          </button>
        </div>

      </div>
    </div>
  `,
})
export class SubscriptionComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  view = signal<SubView>('PLANS');
  loading = signal(false);
  error = signal<string | null>(null);

  selectedPlan = signal<string | null>(null);
  mandateRef = signal<string | null>(null);
  consumerId = signal<string | null>(null);

  bankDetails = {
    bankCode: '',
    accountNumber: '',
    branchCode: '',
  };

  private pollInterval: any;

  constructor() {
    // Retrieve consumerId from sessionStorage (set during onboarding)
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    // If not found in session, we will default to a fallback for testing (or raise error)
    if (storedId) {
      this.consumerId.set(storedId);
    } else {
      // Create a default session ID if missing for development flow ease
      this.consumerId.set('consumer-uuid');
    }

    // Stop polling on component destruction
    effect((onCleanup) => {
      onCleanup(() => this.stopPolling());
    });
  }

  selectPlan(plan: string) {
    this.selectedPlan.set(plan);
  }

  proceedToBank() {
    this.view.set('BANK');
  }

  submitDebiCheck() {
    if (!this.bankDetails.bankCode || !this.bankDetails.accountNumber) {
      this.error.set('Please fill out your bank name and account number.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const payload = {
      consumerId: this.consumerId(),
      planCode: this.selectedPlan(),
      bankCode: this.bankDetails.bankCode,
      accountNumber: this.bankDetails.accountNumber,
    };

    this.http.post<any>('http://localhost:3000/api/v1/subscriptions', payload).subscribe({
      next: (res) => {
        this.mandateRef.set(res.mandateRef);
        this.view.set('WAITING');
        this.loading.set(false);
        this.startPolling();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to initiate subscription.');
        this.loading.set(false);
      },
    });
  }

  private startPolling() {
    this.stopPolling();
    this.pollInterval = setInterval(() => {
      this.checkStatus();
    }, 5000);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private checkStatus() {
    this.http.get<any>(`http://localhost:3000/api/v1/subscriptions/status?consumerId=${this.consumerId()}`).subscribe({
      next: (res) => {
        if (res.status === 'ACTIVE' && res.mandateStatus === 'AUTHENTICATED') {
          this.stopPolling();
          this.router.navigate(['/credit']);
        }
      },
    });
  }

  simulateMockApproval() {
    if (!this.mandateRef()) return;
    this.http.post('http://localhost:3000/api/v1/subscriptions/webhook/debicheck', {
      mandateRef: this.mandateRef(),
      status: 'AUTHENTICATED',
    }).subscribe({
      next: () => {
        this.checkStatus(); // Force check status immediately
      },
    });
  }
}
