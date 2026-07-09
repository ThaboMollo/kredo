import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-stone-50 text-stone-900 flex flex-col antialiased md:flex-row">
      <!-- Sidebar Navigation -->
      <aside class="w-full md:w-64 bg-stone-900 text-stone-400 p-6 flex flex-col justify-between border-r border-stone-800">
        <div class="flex flex-col gap-8">
          <div class="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Kredo</span><span class="text-primary font-bold text-2xl">.</span>
          </div>

          <nav class="flex flex-col gap-2 font-medium text-sm">
            <a (click)="goTo('/dashboard')" class="flex items-center gap-3 bg-stone-800 text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
              <span>📊</span> Dashboard
            </a>
            <a (click)="goTo('/wallet')" class="flex items-center gap-3 hover:bg-stone-800 hover:text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
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
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
              {{ consumerName().substring(0,2) }}
            </div>
            <div class="flex flex-col text-xs leading-none">
              <span (click)="goTo('/profile')" class="text-white font-semibold hover:underline cursor-pointer">{{ consumerName() }}</span>
              <span class="text-stone-500 mt-1">Student Member</span>
            </div>
          </div>
          <button (click)="logout()" class="text-left text-xs font-semibold hover:text-white flex items-center gap-2 text-stone-500 transition-all cursor-pointer">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="flex-1 flex flex-col">
        <!-- Top Header -->
        <header class="bg-white border-b border-stone-200/60 p-6 flex justify-between items-center">
          <h1 class="text-2xl font-extrabold tracking-tight">Overview</h1>
          <div class="flex items-center gap-4">
            <span class="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              FICA Verified
            </span>
          </div>
        </header>

        <!-- Content Area -->
        <div class="p-6 md:p-8 flex-1 flex flex-col gap-6 max-w-5xl">
          <!-- Balance Widget Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Available Credit Facility -->
            <div class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-2">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Available Credit Limit</span>
              <div class="text-3xl font-extrabold text-stone-900 mt-1">
                R{{ (facilityLimit() - utilisedLimit()) / 100 | number:'1.2-2' }}
              </div>
              <p class="text-xs text-stone-500 mt-2">Revolving facility limit is capped at R{{ facilityLimit() / 100 | number }}</p>
            </div>

            <!-- Utilised Credit Facility -->
            <div class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-2">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Utilised Facility</span>
              <div class="text-3xl font-extrabold text-stone-900 mt-1">
                R{{ utilisedLimit() / 100 | number:'1.2-2' }}
              </div>
              <p class="text-xs text-stone-500 mt-2">Amount drawn down for active retailer vouchers.</p>
            </div>

            <!-- Outstanding Balance (Receivables) -->
            <div class="bg-stone-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Outstanding Balance</span>
                <div class="text-3xl font-extrabold mt-1 text-white">
                  R{{ outstandingReceivable() / 100 | number:'1.2-2' }}
                </div>
              </div>
              <button *ngIf="outstandingReceivable() > 0" (click)="triggerPayNow()" class="bg-primary hover:bg-primary/95 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition-all w-fit mt-4 cursor-pointer">
                Pay Now
              </button>
            </div>
          </div>

          <!-- Quick Actions & Timeline -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <!-- Active Vouchers Wallet Overview -->
            <div class="lg:col-span-8 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div class="flex justify-between items-center border-b border-stone-100 pb-3">
                <h3 class="font-extrabold text-stone-950">Active Vouchers</h3>
                <button class="text-xs font-semibold text-primary hover:underline cursor-pointer">Go to Wallet →</button>
              </div>
              <div class="py-4 text-center text-stone-400 text-sm flex flex-col items-center gap-2">
                <span>🎫</span>
                <span>You have no active vouchers. Click "Voucher Wallet" to draw down from your limit.</span>
              </div>
            </div>

            <!-- Credit Progress Sidebar -->
            <div class="lg:col-span-4 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div class="border-b border-stone-100 pb-3">
                <h3 class="font-extrabold text-stone-950">Credit Standing</h3>
              </div>
              <div class="flex flex-col gap-3">
                <div class="flex justify-between text-xs font-semibold">
                  <span class="text-stone-500">Repayment streak</span>
                  <span class="text-emerald-600">0 Months</span>
                </div>
                <div class="flex justify-between text-xs font-semibold">
                  <span class="text-stone-500">Bureaus files submitted</span>
                  <span class="text-stone-600">None</span>
                </div>
                <div class="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl text-[10px] text-stone-500 leading-normal mt-2">
                  Maintain prompt repayment behavior to build positive credit reports. Reports compile monthly on the 1st.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  consumerId = signal<string>('consumer-uuid');
  consumerName = signal<string>('Thabo Mollo');
  
  // Credit Telemetry (in cents)
  facilityLimit = signal(150000); // R1 500.00 default
  utilisedLimit = signal(0);
  outstandingReceivable = signal(0);

  ngOnInit() {
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    if (storedId) {
      this.consumerId.set(storedId);
    }
    this.fetchProfile();
    this.fetchLedgerBalance();
  }

  private fetchProfile() {
    this.http.get<any>(`http://localhost:3000/api/v1/consumers/${this.consumerId()}`).subscribe({
      next: (res) => {
        this.consumerName.set(`${res.firstName} ${res.lastName}`);
      },
    });
  }

  private fetchLedgerBalance() {
    // Check active subscription limits
    this.http.get<any>(`http://localhost:3000/api/v1/subscriptions/status?consumerId=${this.consumerId()}`).subscribe({
      next: (res) => {
        if (res.planCode === 'STUDENT_PREMIUM') {
          this.facilityLimit.set(350000); // R3 500.00 limit
        }
      },
    });
  }

  triggerPayNow() {
    this.http.post<any>('http://localhost:3000/api/v1/repayments/pay-now', {
      consumerId: this.consumerId(),
      amount: this.outstandingReceivable(),
    }).subscribe({
      next: (res) => {
        // Redirect to mocked PSP checkout
        window.open(res.checkoutUrl, '_blank');
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
