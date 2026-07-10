import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PortalShellComponent } from '../../shared/portal-shell';
import { environment } from '../../../environments/environment';

interface Voucher {
  id: string;
  merchantName: string;
  amount: number; // in cents
  code: string;
  qrValue: string;
  status: string;
  expiryDate: string;
}

const LABEL = 'font-caption text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft';
const FIELD =
  'bg-surface border border-line rounded-sm px-3.5 h-[54px] font-body text-lg text-ink focus:outline-none focus:border-accent w-full';
const BUTTON =
  'bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-3.5 rounded-sm transition-opacity cursor-pointer disabled:opacity-50';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, PortalShellComponent],
  template: `
    <app-portal-shell [status]="hasFacility() ? 'Facility active' : 'No facility yet'">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div class="flex flex-col gap-2">
          <span class="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">Closed-loop vouchers</span>
          <h1 class="font-heading text-4xl md:text-5xl leading-[1.05] text-ink">Voucher wallet</h1>
        </div>
        <div class="border border-line rounded-sm px-4 py-3 flex flex-col gap-0.5 shrink-0">
          <span class="${LABEL}">Available limit</span>
          <span class="font-heading text-2xl text-ink">R {{ availableLimit() / 100 | number : '1.0-0' }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Drawdown form -->
        <div class="lg:col-span-5 bg-surface-tint rounded-sm p-7 flex flex-col gap-4">
          <h2 class="font-heading text-3xl text-ink">Drawdown request</h2>

          <div class="flex flex-col gap-2">
            <label class="${LABEL}">Retail merchant</label>
            <select [(ngModel)]="drawdown.merchantName" class="${FIELD} appearance-none">
              <option value="">— Choose store —</option>
              <option value="Shoprite">Shoprite / Checkers</option>
              <option value="PickNPay">Pick n Pay</option>
              <option value="VanSchaik">Van Schaik Bookstore</option>
              <option value="Boxer">Boxer Superstores</option>
            </select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="${LABEL}">Voucher value (R)</label>
            <input type="number" [(ngModel)]="drawdown.amount" class="${FIELD}" placeholder="e.g. 500" />
          </div>

          <div class="bg-surface border-l-[3px] border-accent p-4">
            <p class="font-body text-base leading-snug text-ink-soft">
              Vouchers are closed-loop and only redeemable at the selected partner retailer within
              your approved facility.
            </p>
          </div>

          @if (error()) {
            <p class="font-caption text-xs font-bold text-red-700">{{ error() }}</p>
          }

          <button (click)="submitDrawdown()" [disabled]="loading()" class="${BUTTON} w-fit">
            {{ loading() ? 'Issuing voucher…' : 'Generate retail voucher' }}
          </button>
        </div>

        <!-- Voucher list -->
        <div class="lg:col-span-7 flex flex-col gap-4">
          <h2 class="font-heading text-3xl text-ink">My vouchers</h2>

          @if (vouchers().length === 0) {
            <div class="border border-line rounded-sm p-10 text-center flex flex-col gap-2">
              <span class="font-heading text-2xl text-ink">No vouchers yet</span>
              <span class="font-body text-base text-ink-soft">Request a drawdown on the left to issue your first voucher.</span>
            </div>
          }

          @for (voucher of vouchers(); track voucher.code) {
            <div class="border border-line rounded-sm p-6 flex flex-col sm:flex-row gap-6 justify-between">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                  <span class="font-heading text-2xl text-ink">{{ voucher.merchantName }}</span>
                  <span class="inline-flex items-center gap-2 bg-surface-tint rounded-sm px-2.5 py-1">
                    <span class="h-2 w-2 rounded-full" [class]="voucher.status === 'ISSUED' ? 'bg-accent' : 'bg-line'"></span>
                    <span class="font-caption text-xs font-bold text-ink">{{ voucher.status }}</span>
                  </span>
                </div>
                <span class="font-heading text-3xl text-ink">R{{ voucher.amount / 100 | number : '1.2-2' }}</span>
                <span class="font-caption text-xs text-ink-soft">Code: <strong class="text-ink select-all">{{ voucher.code }}</strong></span>
                <span class="font-caption text-xs text-ink-soft">Expires: {{ voucher.expiryDate | date : 'mediumDate' }}</span>
              </div>

              <div class="flex flex-col items-center justify-center gap-3 bg-surface-tint rounded-sm p-4 sm:w-40">
                <div class="w-20 h-20 bg-surface border border-line flex items-center justify-center">
                  <span class="font-caption text-[9px] font-bold text-ink-soft text-center">QR<br />{{ voucher.code.slice(0, 7) }}</span>
                </div>
                @if (voucher.status === 'ISSUED') {
                  <button
                    (click)="simulateRedeem(voucher.code)"
                    class="font-caption text-[11px] font-bold border border-line hover:border-accent rounded-sm px-3 py-1.5 text-ink transition-colors cursor-pointer"
                  >
                    Simulate POS scan
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </app-portal-shell>
  `,
})
export class WalletComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  consumerId = signal<string>('consumer-uuid');
  facilityLimit = signal(0);
  utilisedLimit = signal(0);
  hasFacility = signal(false);

  availableLimit = computed(() => this.facilityLimit() - this.utilisedLimit());

  vouchers = signal<Voucher[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  drawdown = {
    merchantName: '',
    amount: null,
  };

  ngOnInit() {
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    if (storedId) {
      this.consumerId.set(storedId);
    }
    this.fetchFacility();
    this.fetchVouchers();
  }

  private fetchFacility() {
    this.http.get<any>(`${environment.apiBaseUrl}/api/v1/credit/facility?consumerId=${this.consumerId()}`).subscribe({
      next: (res) => {
        if (res.status === 'ACTIVE') {
          this.hasFacility.set(true);
          this.facilityLimit.set(res.totalLimit);
          this.utilisedLimit.set(res.utilisedLimit);
        }
      },
    });
  }

  private fetchVouchers() {
    this.http.get<Voucher[]>(`${environment.apiBaseUrl}/api/v1/credit/vouchers?consumerId=${this.consumerId()}`).subscribe({
      next: (list) => this.vouchers.set(list || []),
    });
  }

  submitDrawdown() {
    if (!this.drawdown.merchantName || !this.drawdown.amount) {
      this.error.set('Please select a merchant and enter a voucher value.');
      return;
    }

    const valueCents = Math.floor(Number(this.drawdown.amount) * 100);
    if (valueCents > this.availableLimit()) {
      this.error.set('Drawdown value exceeds your available credit facility limit.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const idempotencyKey = `DRAW-${this.consumerId()}-${Date.now()}`;
    const headers = new HttpHeaders({
      'Idempotency-Key': idempotencyKey,
    });

    const payload = {
      consumerId: this.consumerId(),
      merchantName: this.drawdown.merchantName,
      amount: valueCents,
    };

    this.http.post<any>(`${environment.apiBaseUrl}/api/v1/credit/drawdowns`, payload, { headers }).subscribe({
      next: (res) => {
        this.vouchers.update((list) => [res.voucher, ...list]);
        this.utilisedLimit.update((val) => val + valueCents);
        this.drawdown = { merchantName: '', amount: null };
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Voucher drawdown failed.');
        this.loading.set(false);
      },
    });
  }

  simulateRedeem(code: string) {
    this.http.post(`${environment.apiBaseUrl}/api/v1/credit/drawdowns/redeem`, {
      voucherCode: code,
    }).subscribe({
      next: () => {
        // Refresh local list state
        this.vouchers.update((list) =>
          list.map((v) => (v.code === code ? { ...v, status: 'REDEEMED' } : v))
        );
      },
    });
  }
}
