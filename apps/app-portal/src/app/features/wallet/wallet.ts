import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Voucher {
  id: string;
  merchantName: string;
  amount: number; // in cents
  code: string;
  qrValue: string;
  status: string;
  expiryDate: string;
}

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-stone-50 text-stone-900 flex flex-col antialiased md:flex-row">
      <!-- Sidebar Navigation -->
      <aside class="w-full md:w-64 bg-stone-900 text-stone-400 p-6 flex flex-col justify-between border-r border-stone-800">
        <div class="flex flex-col gap-8">
          <div class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Kredo</span><span class="text-primary font-bold text-2xl">.</span>
          </div>

          <nav class="flex flex-col gap-2 font-medium text-sm">
            <a (click)="goTo('/dashboard')" class="flex items-center gap-3 hover:bg-stone-800 hover:text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
              <span>📊</span> Dashboard
            </a>
            <a (click)="goTo('/wallet')" class="flex items-center gap-3 bg-stone-800 text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
              <span>💳</span> Voucher Wallet
            </a>
            <a (click)="goTo('/repayments')" class="flex items-center gap-3 hover:bg-stone-800 hover:text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
              <span>💸</span> Repayments
            </a>
            <a (click)="goTo('/progress')" class="flex items-center gap-3 hover:bg-stone-800 hover:text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
              <span>📈</span> Credit Progress
            </a>
          </nav>
        </div>

        <div class="pt-6 border-t border-stone-800 flex flex-col gap-4">
          <button (click)="logout()" class="text-left text-xs font-semibold hover:text-white flex items-center gap-2 text-stone-500 transition-all cursor-pointer">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="flex-1 flex flex-col">
        <!-- Top Header -->
        <header class="bg-white border-b border-stone-200/60 p-6 flex justify-between items-center">
          <h1 class="text-2xl font-extrabold tracking-tight">Voucher Wallet</h1>
          <div class="bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-xl">
            Available Limit: R{{ availableLimit() / 100 | number:'1.2-2' }}
          </div>
        </header>

        <!-- Content Area -->
        <div class="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl">
          
          <!-- Drawdown Form panel -->
          <div class="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 class="font-extrabold text-lg text-stone-900 border-b border-stone-100 pb-2">Drawdown Request</h3>
            
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-stone-500">Select Retail Merchant</label>
              <select [(ngModel)]="drawdown.merchantName" class="border border-stone-300 rounded-xl p-3 text-sm focus:outline-none bg-white">
                <option value="">-- Choose Store --</option>
                <option value="Shoprite">Shoprite / Checkers</option>
                <option value="PickNPay">Pick n Pay</option>
                <option value="VanSchaik">Van Schaik Bookstore</option>
                <option value="Boxer">Boxer Superstores</option>
              </select>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-stone-500">Voucher Value (R)</label>
              <input type="number" [(ngModel)]="drawdown.amount" class="border border-stone-300 rounded-xl p-3 text-sm focus:outline-none" placeholder="e.g. 500" />
            </div>

            <p *ngIf="error()" class="text-xs text-red-600 font-semibold mt-1">{{ error() }}</p>

            <button (click)="submitDrawdown()" [disabled]="loading()" class="w-full bg-primary hover:bg-primary/95 text-white font-bold py-4 rounded-2xl transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer">
              {{ loading() ? 'Issuing Voucher...' : 'Generate Retail Voucher' }}
            </button>
          </div>

          <!-- Active Vouchers List -->
          <div class="lg:col-span-7 flex flex-col gap-6">
            <h3 class="font-extrabold text-lg text-stone-900 border-b border-stone-100 pb-2">My Vouchers</h3>

            <div *ngIf="vouchers().length === 0" class="bg-white border border-stone-200 rounded-3xl p-10 text-center text-stone-400 text-sm shadow-sm flex flex-col items-center gap-3">
              <span class="text-3xl">🎫</span>
              <span>No vouchers generated yet. Request a drawdown on the left.</span>
            </div>

            <div *ngFor="let voucher of vouchers()" class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center justify-between hover:shadow-md transition-all relative overflow-hidden">
              <!-- Left: details -->
              <div class="flex flex-col gap-2.5 w-full sm:w-2/3">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-stone-900">{{ voucher.merchantName }} Voucher</span>
                  <span [class.bg-emerald-50]="voucher.status === 'ISSUED'" [class.text-emerald-700]="voucher.status === 'ISSUED'" [class.bg-stone-100]="voucher.status === 'REDEEMED'" [class.text-stone-500]="voucher.status === 'REDEEMED'" class="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border">
                    {{ voucher.status }}
                  </span>
                </div>
                <div class="text-xl font-black text-stone-950">R{{ voucher.amount / 100 | number:'1.2-2' }}</div>
                <div class="text-[10px] text-stone-400 font-mono mt-1">Code: <strong class="text-stone-800 select-all">{{ voucher.code }}</strong></div>
                <div class="text-[10px] text-stone-400 mt-0.5">Expires: {{ voucher.expiryDate | date:'mediumDate' }}</div>
              </div>

              <!-- Right: Scan QR / Simulate POS -->
              <div class="flex flex-col items-center gap-2 bg-stone-50 border border-stone-200/60 p-4 rounded-2xl w-full sm:w-1/3">
                <!-- Mock QR rendering box -->
                <div class="w-24 h-24 bg-white border border-stone-300 p-2 flex items-center justify-center flex-col gap-1">
                  <span class="text-2xl">📱</span>
                  <span class="text-[8px] font-bold text-stone-400">QR CODE</span>
                </div>
                <button *ngIf="voucher.status === 'ISSUED'" (click)="simulateRedeem(voucher.code)" class="text-[10px] bg-stone-200 hover:bg-stone-300 font-semibold py-1.5 px-3 rounded-lg border border-stone-300 transition-all cursor-pointer">
                  Simulate Scan/POS
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  `,
})
export class WalletComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  consumerId = signal<string>('consumer-uuid');
  facilityLimit = signal(150000);
  utilisedLimit = signal(0);
  
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
    this.fetchLimits();
  }

  private fetchLimits() {
    // 1. Fetch Plan details to set limit
    this.http.get<any>(`http://localhost:3000/api/v1/subscriptions/status?consumerId=${this.consumerId()}`).subscribe({
      next: (res) => {
        if (res.planCode === 'STUDENT_PREMIUM') {
          this.facilityLimit.set(350000);
        }
      },
    });

    // 2. We can pull vouchers and calculate actual utilised limits from them
    // For now we will mock fetch from database or calculate from the list.
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

    this.http.post<any>('http://localhost:3000/api/v1/credit/drawdowns', payload, { headers }).subscribe({
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
    this.http.post('http://localhost:3000/api/v1/credit/drawdowns/redeem', {
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

  goTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/apply']);
  }
}
