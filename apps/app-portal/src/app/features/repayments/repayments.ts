import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-repayments',
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
            <a (click)="goTo('/repayments')" class="flex items-center gap-3 bg-stone-800 text-white px-4 py-3 rounded-xl transition-all cursor-pointer">
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
          <h1 class="text-2xl font-extrabold tracking-tight">Repayments & Statements</h1>
        </header>

        <!-- Content Area -->
        <div class="p-6 md:p-8 flex-1 flex flex-col gap-6 max-w-4xl">
          <div class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 class="font-extrabold text-stone-950">Payment Sandbox Simulation</h3>
            <p class="text-xs text-stone-500">Initiate a mock R500 card repayment to test the double-entry ledger integration.</p>
            
            <button (click)="payNowMock()" [disabled]="paying()" class="w-fit bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer">
              {{ paying() ? 'Processing...' : 'Simulate R500 Payment' }}
            </button>
          </div>

          <!-- History List -->
          <div class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 class="font-extrabold text-stone-950">Monthly Statements</h3>
            <div class="text-xs text-stone-400 py-6 text-center">
              📜 No billing statements generated yet. Statements compile monthly.
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class RepaymentsComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  consumerId = signal<string>('consumer-uuid');
  paying = signal(false);

  ngOnInit() {
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    if (storedId) {
      this.consumerId.set(storedId);
    }
  }

  payNowMock() {
    this.paying.set(true);
    // 1. Get payment URL
    this.http.post<any>(`${environment.apiBaseUrl}/api/v1/repayments/pay-now`, {
      consumerId: this.consumerId(),
      amount: 50000, // R500.00
    }).subscribe({
      next: (res) => {
        // 2. Call mock webhook instantly to clear payment
        this.http.post(`${environment.apiBaseUrl}/api/v1/repayments/webhook/yoco`, {
          consumerId: this.consumerId(),
          amount: 50000,
          paymentRef: res.paymentRef,
          status: 'SUCCESS',
        }).subscribe({
          next: () => {
            this.paying.set(false);
            alert('Mock repayment of R500 processed successfully! Ledger transaction posted.');
          },
          error: () => this.paying.set(false),
        });
      },
      error: () => this.paying.set(false),
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
