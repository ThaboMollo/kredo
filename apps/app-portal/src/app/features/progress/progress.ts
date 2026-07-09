import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-progress',
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
            <a (click)="goTo('/dashboard')" class="flex items-center gap-3 hover:bg-stone-800 hover:text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
              <span>📊</span> Dashboard
            </a>
            <a (click)="goTo('/wallet')" class="flex items-center gap-3 hover:bg-stone-800 hover:text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
              <span>💳</span> Voucher Wallet
            </a>
            <a (click)="goTo('/repayments')" class="flex items-center gap-3 hover:bg-stone-800 hover:text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
              <span>💸</span> Repayments
            </a>
            <a (click)="goTo('/progress')" class="flex items-center gap-3 bg-stone-800 text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
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
          <h1 class="text-2xl font-extrabold tracking-tight">Credit History Progress</h1>
        </header>

        <!-- Content Area -->
        <div class="p-6 md:p-8 flex-1 flex flex-col gap-6 max-w-4xl">
          <!-- Overview Streaks -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-1">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Repayment Consistency</span>
              <div class="text-3xl font-extrabold mt-1 text-emerald-600">100%</div>
              <p class="text-xs text-stone-500 mt-2">All payments have been made on time.</p>
            </div>

            <div class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-1">
              <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Bureaus Reported</span>
              <div class="text-3xl font-extrabold mt-1 text-stone-900">TransUnion</div>
              <p class="text-xs text-stone-500 mt-2">Historical files reported to TransUnion credit registries.</p>
            </div>
          </div>

          <!-- Educational info card -->
          <div class="bg-stone-900 text-white rounded-3xl p-8 flex flex-col gap-4 shadow-lg">
            <h3 class="text-xl font-bold">How Kredo helps you build credit</h3>
            <p class="text-stone-300 text-sm leading-relaxed">
              Every month that you keep your Kredo subscription active and repay any drawn voucher balances on time, we compile a status record and submit it to South African credit registries. 
            </p>
            <p class="text-stone-300 text-sm leading-relaxed">
              By maintaining this positive behavior, you build an official financial profile. When you graduate, you'll have an established credit history that helps you qualify for home leases, auto finance, and corporate accounts without predatory rates.
            </p>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class ProgressComponent implements OnInit {
  private router = inject(Router);

  consumerId = signal<string>('consumer-uuid');

  ngOnInit() {
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    if (storedId) {
      this.consumerId.set(storedId);
    }
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/apply']);
  }
}
