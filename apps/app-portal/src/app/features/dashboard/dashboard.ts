import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PortalShellComponent } from '../../shared/portal-shell';
import { environment } from '../../../environments/environment';

interface FacilityState {
  status: string;
  totalLimit: number;
  utilisedLimit: number;
  available: number;
}

interface VoucherState {
  merchantName: string;
  amount: number;
  status: string;
  expiryDate: string;
}

const METRIC_LABEL = 'font-caption text-xs font-bold text-ink-soft';
const METRIC_VALUE = 'font-heading text-3xl text-ink';
const METRIC_NOTE = 'font-body text-[15px] text-ink-soft';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PortalShellComponent],
  template: `
    <app-portal-shell [status]="portalStatus()">
      <!-- Dashboard header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div class="flex flex-col gap-2">
          <span class="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Welcome back{{ firstName() ? ', ' + firstName() : '' }}
          </span>
          <h1 class="font-heading text-4xl md:text-5xl leading-[1.05] text-ink">
            Your credit-building workspace
          </h1>
        </div>
        <button
          (click)="goTo('/wallet')"
          class="bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-5 py-3.5 rounded-sm transition-opacity cursor-pointer shrink-0"
        >
          Request voucher
        </button>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="border border-line rounded-sm p-4.5 flex flex-col gap-1.5">
          <span class="${METRIC_LABEL}">Available facility</span>
          <span class="${METRIC_VALUE}">{{ facility() ? 'R ' + (facility()!.available / 100 | number : '1.0-0') : '—' }}</span>
          <span class="${METRIC_NOTE}">
            {{ facility() ? 'R ' + (facility()!.utilisedLimit / 100 | number : '1.0-0') + ' utilised' : 'No facility yet' }}
          </span>
        </div>
        <div class="border border-line rounded-sm p-4.5 flex flex-col gap-1.5">
          <span class="${METRIC_LABEL}">Next DebiCheck</span>
          <span class="${METRIC_VALUE}">{{ nextBilling() ? (nextBilling() | date : 'd MMM') : '—' }}</span>
          <span class="${METRIC_NOTE}">{{ planLabel() }}</span>
        </div>
        <div class="border border-line rounded-sm p-4.5 flex flex-col gap-1.5">
          <span class="${METRIC_LABEL}">Voucher status</span>
          <span class="${METRIC_VALUE}">{{ activeVouchers().length }} active</span>
          <span class="${METRIC_NOTE}">{{ voucherNote() }}</span>
        </div>
        <div class="border border-line rounded-sm p-4.5 flex flex-col gap-1.5">
          <span class="${METRIC_LABEL}">KYC status</span>
          <span class="${METRIC_VALUE}">{{ kycLabel() }}</span>
          <span class="${METRIC_NOTE}">{{ studentVerified() ? 'Student status verified' : 'Student status pending' }}</span>
        </div>
      </div>

      <!-- Body: facility overview + action queue -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Facility overview panel -->
        <div class="lg:col-span-6 bg-surface-tint rounded-sm p-7 flex flex-col gap-5">
          <span class="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">Facility</span>
          <h2 class="font-heading text-3xl md:text-4xl leading-[1.05] text-ink">Keep the next action obvious.</h2>
          <p class="font-body text-lg leading-relaxed text-ink-soft">
            The dashboard shows limits and repayments from backend data only. Large drawdowns,
            signing, and bank-detail changes require step-up authentication before the action
            continues.
          </p>

          <div class="flex flex-col gap-3.5">
            @for (bar of progressBars(); track bar.label) {
              <div class="flex flex-col gap-2">
                <div class="flex justify-between gap-3">
                  <span class="font-caption text-xs font-bold text-ink">{{ bar.label }}</span>
                  <span class="font-caption text-xs font-bold text-ink-soft">{{ bar.display }}</span>
                </div>
                <div class="h-2 bg-line rounded-none overflow-hidden">
                  <div class="h-full bg-accent" [style.width.%]="bar.percent"></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Action queue panel -->
        <div class="lg:col-span-6 flex flex-col gap-4">
          <div class="border border-line rounded-sm p-6 flex flex-col gap-3">
            <h3 class="font-heading text-3xl text-ink">Required actions</h3>
            @for (action of requiredActions(); track action.label) {
              <div class="flex items-center gap-3.5 border-b border-line py-3 last:border-b-0">
                <span class="inline-flex items-center gap-2 bg-surface-tint rounded-sm px-2.5 py-1.5 shrink-0">
                  <span class="h-2 w-2 rounded-full bg-accent"></span>
                  <span class="font-caption text-xs font-bold text-ink">{{ action.status }}</span>
                </span>
                <a (click)="goTo(action.path)" class="font-body text-lg text-ink cursor-pointer hover:text-accent transition-colors">
                  {{ action.label }}
                </a>
              </div>
            }
          </div>

          <div class="border border-line rounded-sm p-6 flex flex-col gap-3">
            <h3 class="font-heading text-3xl text-ink">Recent activity</h3>
            @if (recentActivity().length === 0) {
              <p class="font-body text-base text-ink-soft">No ledger activity yet. Draw down your first voucher to get started.</p>
            }
            @for (entry of recentActivity(); track entry.label) {
              <div class="flex items-center justify-between gap-4">
                <span class="font-body text-lg text-ink">{{ entry.label }}</span>
                <span class="font-caption text-sm font-bold text-accent">{{ entry.amount }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </app-portal-shell>
  `,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  consumerId = signal<string>('consumer-uuid');
  firstName = signal<string>('');
  kycStatus = signal<string>('PENDING');
  studentVerified = signal<boolean>(false);

  facility = signal<FacilityState | null>(null);
  vouchers = signal<VoucherState[]>([]);
  planCode = signal<string | null>(null);
  nextBilling = signal<string | null>(null);

  activeVouchers = computed(() => this.vouchers().filter((v) => v.status === 'ISSUED'));

  portalStatus = computed(() => {
    if (this.facility()) return 'Facility active';
    if (this.kycStatus() === 'VERIFIED') return 'KYC verified';
    return 'Getting started';
  });

  kycLabel = computed(() => {
    switch (this.kycStatus()) {
      case 'VERIFIED': return 'Verified';
      case 'MANUAL_REVIEW': return 'In review';
      default: return 'Pending';
    }
  });

  planLabel = computed(() => {
    switch (this.planCode()) {
      case 'STUDENT_PREMIUM': return 'Builder plan · R99 scheduled';
      case 'STUDENT_BASIC': return 'Starter plan · R59 scheduled';
      default: return 'No subscription yet';
    }
  });

  voucherNote = computed(() => {
    const active = this.activeVouchers();
    if (active.length === 0) return 'No active vouchers';
    const soonest = active
      .map((v) => new Date(v.expiryDate).getTime())
      .sort((a, b) => a - b)[0];
    const days = Math.max(0, Math.ceil((soonest - Date.now()) / 86400000));
    return `Expires in ${days} days`;
  });

  progressBars = computed(() => {
    const facility = this.facility();
    const used = facility && facility.totalLimit > 0
      ? Math.round((facility.utilisedLimit / facility.totalLimit) * 100)
      : 0;
    const redeemed = this.vouchers().filter((v) => v.status === 'REDEEMED').length;
    const voucherTotal = this.vouchers().length;
    const profileScore =
      25 +
      (this.kycStatus() === 'VERIFIED' ? 25 : 0) +
      (this.studentVerified() ? 25 : 0) +
      (facility ? 25 : 0);

    return [
      { label: 'Facility used', display: `${used}%`, percent: used },
      {
        label: 'Vouchers redeemed',
        display: `${redeemed} of ${voucherTotal}`,
        percent: voucherTotal > 0 ? (redeemed / voucherTotal) * 100 : 0,
      },
      { label: 'Profile complete', display: `${profileScore}%`, percent: profileScore },
    ];
  });

  requiredActions = computed(() => {
    const actions: { label: string; status: string; path: string }[] = [];
    if (this.kycStatus() !== 'VERIFIED') {
      actions.push({ label: 'Complete identity verification', status: 'Start now', path: '/apply' });
    }
    if (!this.planCode()) {
      actions.push({ label: 'Choose a subscription plan', status: 'Up next', path: '/subscribe' });
    }
    if (!this.facility()) {
      actions.push({ label: 'Apply for your credit facility', status: 'Ready to continue', path: '/credit' });
    } else {
      actions.push({ label: 'Request a retailer voucher', status: 'Ready to continue', path: '/wallet' });
      actions.push({ label: 'Review your repayment schedule', status: 'Scheduled', path: '/repayments' });
    }
    return actions;
  });

  recentActivity = computed(() => {
    const entries = this.vouchers().slice(0, 3).map((v) => ({
      label: v.status === 'REDEEMED' ? `Voucher redeemed · ${v.merchantName}` : `Voucher issued · ${v.merchantName}`,
      amount: `R${Math.round(v.amount / 100)}`,
    }));
    if (this.planCode()) {
      entries.push({
        label: 'Subscription fee',
        amount: this.planCode() === 'STUDENT_PREMIUM' ? 'R99' : 'R59',
      });
    }
    return entries;
  });

  ngOnInit() {
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    if (storedId) {
      this.consumerId.set(storedId);
    }
    this.fetchProfile();
    this.fetchFacility();
    this.fetchSubscription();
    this.fetchVouchers();
  }

  private fetchProfile() {
    this.http.get<any>(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}`).subscribe({
      next: (res) => {
        this.firstName.set(res.firstName || '');
        this.kycStatus.set(res.kycStatus || 'PENDING');
        this.studentVerified.set(!!res.studentVerified);
      },
    });
  }

  private fetchFacility() {
    this.http.get<any>(`${environment.apiBaseUrl}/api/v1/credit/facility?consumerId=${this.consumerId()}`).subscribe({
      next: (res) => {
        if (res.status === 'ACTIVE') {
          this.facility.set(res);
        }
      },
    });
  }

  private fetchSubscription() {
    this.http.get<any>(`${environment.apiBaseUrl}/api/v1/subscriptions/status?consumerId=${this.consumerId()}`).subscribe({
      next: (res) => {
        if (res.status && res.status !== 'NONE') {
          this.planCode.set(res.planCode);
          this.nextBilling.set(res.nextBilling);
        }
      },
    });
  }

  private fetchVouchers() {
    this.http.get<VoucherState[]>(`${environment.apiBaseUrl}/api/v1/credit/vouchers?consumerId=${this.consumerId()}`).subscribe({
      next: (list) => this.vouchers.set(list || []),
    });
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
