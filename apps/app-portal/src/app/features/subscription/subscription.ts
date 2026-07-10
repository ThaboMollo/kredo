import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { WizardShellComponent } from '../../shared/wizard-shell';
import { environment } from '../../../environments/environment';

type SubView = 'PLANS' | 'BANK' | 'WAITING';

const LABEL = 'font-caption text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft';
const FIELD =
  'bg-surface border border-line rounded-sm px-3.5 h-[54px] font-body text-lg text-ink focus:outline-none focus:border-accent w-full';
const BUTTON =
  'bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-3.5 rounded-sm transition-opacity cursor-pointer disabled:opacity-50';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule, WizardShellComponent],
  template: `
    <app-wizard-shell [active]="3" [eyebrow]="eyebrow()" [heading]="heading()">
      <!-- View 1: PLANS -->
      @if (view() === 'PLANS') {
        <div class="flex flex-col gap-6 max-w-3xl">
          <p class="font-body text-lg text-ink-soft max-w-xl">
            Our facilities are interest-free. You only pay a fixed monthly subscription, collected
            by DebiCheck.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button
              (click)="selectPlan('STUDENT_BASIC')"
              class="text-left rounded-sm p-6 cursor-pointer flex flex-col gap-3 border transition-colors"
              [class]="selectedPlan() === 'STUDENT_BASIC' ? 'border-accent bg-surface-tint' : 'border-line bg-surface'"
            >
              <span class="font-caption text-sm font-bold text-accent">Starter</span>
              <span class="font-heading text-4xl text-ink">R59 <span class="text-lg text-ink-soft">/ month</span></span>
              <p class="font-body text-base leading-snug text-ink-soft">
                A revolving retail credit facility of up to <strong class="text-ink">R1 500</strong>.
              </p>
            </button>

            <button
              (click)="selectPlan('STUDENT_PREMIUM')"
              class="text-left rounded-sm p-6 cursor-pointer flex flex-col gap-3 border transition-colors"
              [class]="selectedPlan() === 'STUDENT_PREMIUM' ? 'border-accent bg-surface-tint' : 'border-line bg-surface'"
            >
              <span class="font-caption text-sm font-bold text-accent">Builder</span>
              <span class="font-heading text-4xl text-ink">R99 <span class="text-lg text-ink-soft">/ month</span></span>
              <p class="font-body text-base leading-snug text-ink-soft">
                A revolving retail credit facility of up to <strong class="text-ink">R3 500</strong>.
              </p>
            </button>
          </div>

          @if (error()) {
            <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
          }

          <button (click)="proceedToBank()" [disabled]="!selectedPlan()" class="${BUTTON} w-fit">
            Continue to DebiCheck setup
          </button>
        </div>
      }

      <!-- View 2: BANK -->
      @if (view() === 'BANK') {
        <div class="bg-surface-tint rounded-sm p-7 flex flex-col gap-4 w-full max-w-xl">
          <div class="flex flex-col gap-2">
            <label class="${LABEL}">Bank</label>
            <select [(ngModel)]="bankDetails.bankCode" class="${FIELD} appearance-none">
              <option value="">— Choose your bank —</option>
              <option value="FNB">FNB</option>
              <option value="Standard Bank">Standard Bank</option>
              <option value="Capitec">Capitec</option>
              <option value="Absa">Absa</option>
              <option value="Nedbank">Nedbank</option>
              <option value="TymeBank">TymeBank</option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="${LABEL}">Account number</label>
            <input type="text" [(ngModel)]="bankDetails.accountNumber" class="${FIELD}" placeholder="62000000000" />
          </div>

          <div class="bg-surface border-l-[3px] border-accent p-4 flex flex-col gap-1.5">
            <span class="font-caption text-xs font-bold text-accent">DebiCheck authenticated mandate</span>
            <p class="font-body text-base leading-snug text-ink-soft">
              Your bank will ask you to approve the mandate before any collection happens. Account
              details are encrypted at rest.
            </p>
          </div>

          @if (error()) {
            <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
          }

          <button (click)="submitDebiCheck()" [disabled]="loading()" class="${BUTTON} w-fit">
            {{ loading() ? 'Initiating…' : 'Create DebiCheck mandate' }}
          </button>
        </div>
      }

      <!-- View 3: WAITING -->
      @if (view() === 'WAITING') {
        <div class="bg-surface-tint rounded-sm p-7 flex flex-col gap-4 w-full max-w-xl">
          <span class="inline-flex items-center gap-2 bg-surface rounded-sm px-2.5 py-1.5 w-fit">
            <span class="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
            <span class="font-caption text-xs font-bold text-ink">Waiting for bank approval</span>
          </span>

          <p class="font-body text-lg text-ink-soft">
            Mandate reference <strong class="text-ink">{{ mandateRef() }}</strong> was sent to your bank.
          </p>

          <ol class="font-body text-base text-ink-soft leading-relaxed list-decimal pl-5 flex flex-col gap-1">
            <li>Open your <strong class="text-ink">{{ bankDetails.bankCode }}</strong> banking application.</li>
            <li>Navigate to <strong class="text-ink">Debits / Mandates / DebiCheck</strong>.</li>
            <li>Review the details for Kalahari and approve.</li>
            <li>Or dial your bank's USSD authentication code (e.g. *120*229#) if requested.</li>
          </ol>

          <p class="font-caption text-xs text-ink-soft">Status is checked automatically every 5 seconds.</p>

          @if (error()) {
            <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
          }

          <button
            (click)="simulateMockApproval()"
            class="border border-line hover:border-accent text-ink font-caption text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors cursor-pointer w-fit"
          >
            Simulate mandate approval (sandbox)
          </button>
        </div>
      }
    </app-wizard-shell>
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
    if (storedId) {
      this.consumerId.set(storedId);
    } else {
      this.consumerId.set('consumer-uuid');
    }

    // Stop polling on component destruction
    effect((onCleanup) => {
      onCleanup(() => this.stopPolling());
    });
  }

  eyebrow = computed(() => {
    switch (this.view()) {
      case 'PLANS': return 'Subscription';
      case 'BANK': return 'DebiCheck mandate';
      case 'WAITING': return 'Bank authentication';
    }
  });

  heading = computed(() => {
    switch (this.view()) {
      case 'PLANS': return 'Select a subscription plan.';
      case 'BANK': return 'Set up your debit order.';
      case 'WAITING': return 'Approve the mandate in your bank app.';
    }
  });

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

    this.http.post<any>(`${environment.apiBaseUrl}/api/v1/subscriptions`, payload).subscribe({
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
    this.http.get<any>(`${environment.apiBaseUrl}/api/v1/subscriptions/status?consumerId=${this.consumerId()}`).subscribe({
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
    this.http.post(`${environment.apiBaseUrl}/api/v1/subscriptions/webhook/debicheck`, {
      mandateRef: this.mandateRef(),
      status: 'AUTHENTICATED',
    }).subscribe({
      next: () => {
        this.checkStatus(); // Force check status immediately
      },
    });
  }
}
