import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Consent {
  id: string;
  consentType: string;
  status: string;
  timestamp: string;
  version: string;
}

@Component({
  selector: 'app-profile',
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
              <span class="text-stone-500 mt-1">Settings</span>
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
          <h1 class="text-2xl font-extrabold tracking-tight">Privacy & Settings</h1>
        </header>

        <!-- Content Area -->
        <div class="p-6 md:p-8 flex-1 flex flex-col gap-8 max-w-4xl">
          
          <!-- POPIA Consents Section -->
          <div class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 class="font-extrabold text-lg text-stone-900 border-b border-stone-100 pb-2">POPIA Consents Management</h3>
            <p class="text-xs text-stone-500 leading-relaxed">
              Review and manage the active consents granted for data processing and bureau checks. In accordance with POPIA rules, withdrawing essential consents will restrict active credit facility actions.
            </p>

            <div class="flex flex-col gap-4 mt-2">
              <!-- Consent Row 1: Marketing -->
              <div class="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                <div class="flex flex-col gap-1 pr-6">
                  <span class="text-sm font-bold text-stone-900">Promotional Marketing</span>
                  <span class="text-[10px] text-stone-400">Receive promotional notifications and newsletters.</span>
                </div>
                <button (click)="toggleConsent('MARKETING')" [class.bg-emerald-600]="marketingGranted()" [class.text-white]="marketingGranted()" class="text-xs font-bold py-2 px-4 rounded-xl border border-stone-300 transition-all cursor-pointer">
                  {{ marketingGranted() ? 'Consent Active' : 'Withdrawn' }}
                </button>
              </div>

              <!-- Consent Row 2: Bureau Enquiry -->
              <div class="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-2xl opacity-80">
                <div class="flex flex-col gap-1 pr-6">
                  <span class="text-sm font-bold text-stone-900">Credit Bureau Enquiries</span>
                  <span class="text-[10px] text-stone-400">Allows us to assess affordability in credit quote checks (Mandatory for credit).</span>
                </div>
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  Required
                </span>
              </div>
            </div>
          </div>

          <!-- POPIA DSAR Section -->
          <div class="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 class="font-extrabold text-lg text-stone-900 border-b border-stone-100 pb-2">Subject Access Request (DSAR)</h3>
            <p class="text-xs text-stone-500 leading-relaxed">
              Request a full export of the personal information stored in our databases, including encrypted values (decrypted for you), consent logs, and voucher listings.
            </p>

            <button (click)="downloadData()" [disabled]="exporting()" class="w-fit bg-stone-900 hover:bg-stone-850 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer text-xs mt-2 disabled:opacity-50">
              {{ exporting() ? 'Compiling JSON...' : 'Download My Personal Data (JSON)' }}
            </button>
          </div>

        </div>
      </main>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  consumerId = signal<string>('consumer-uuid');
  consumerName = signal<string>('Thabo Mollo');

  marketingGranted = signal(false);
  exporting = signal(false);

  ngOnInit() {
    const storedId = sessionStorage.getItem('kredo_consumer_id');
    if (storedId) {
      this.consumerId.set(storedId);
    }
    this.fetchProfile();
    this.fetchConsents();
  }

  private fetchProfile() {
    this.http.get<any>(`http://localhost:3000/api/v1/consumers/${this.consumerId()}`).subscribe({
      next: (res) => {
        this.consumerName.set(`${res.firstName} ${res.lastName}`);
      },
    });
  }

  private fetchConsents() {
    this.http.get<Consent[]>(`http://localhost:3000/api/v1/consumers/${this.consumerId()}/consents`).subscribe({
      next: (list) => {
        const marketing = list.find((c) => c.consentType === 'MARKETING');
        this.marketingGranted.set(marketing?.status === 'GRANTED');
      },
    });
  }

  toggleConsent(type: string) {
    const targetStatus = this.marketingGranted() ? 'WITHDRAWN' : 'GRANTED';
    
    this.http.post(`http://localhost:3000/api/v1/consumers/${this.consumerId()}/consents`, {
      consentType: type,
      status: targetStatus,
      version: 'v1.0',
    }).subscribe({
      next: () => {
        this.marketingGranted.set(targetStatus === 'GRANTED');
        alert(`Consent type ${type} successfully updated to ${targetStatus}.`);
      },
    });
  }

  downloadData() {
    this.exporting.set(true);
    this.http.get(`http://localhost:3000/api/v1/consumers/${this.consumerId()}/data-export`).subscribe({
      next: (res) => {
        const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kredo-my-data-${this.consumerId()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting.set(false);
      },
      error: () => {
        alert('Failed to compile data export.');
        this.exporting.set(false);
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
