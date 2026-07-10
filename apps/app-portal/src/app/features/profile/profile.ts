import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PortalShellComponent } from '../../shared/portal-shell';
import { environment } from '../../../environments/environment';

interface Consent {
  id: string;
  consentType: string;
  status: string;
  timestamp: string;
  version: string;
}

const BUTTON =
  'bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-3.5 rounded-sm transition-opacity cursor-pointer disabled:opacity-50';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PortalShellComponent],
  template: `
    <app-portal-shell>
      <div class="flex flex-col gap-2">
        <span class="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">Your data, your rules</span>
        <h1 class="font-heading text-4xl md:text-5xl leading-[1.05] text-ink">Profile &amp; consents</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Identity card -->
        <div class="lg:col-span-5 bg-surface-tint rounded-sm p-7 flex flex-col gap-4">
          <h2 class="font-heading text-3xl text-ink">{{ consumerName() }}</h2>
          <span class="inline-flex items-center gap-2 bg-surface rounded-sm px-2.5 py-1.5 w-fit">
            <span class="h-2 w-2 rounded-full bg-accent"></span>
            <span class="font-caption text-xs font-bold text-ink">Student member</span>
          </span>
          <p class="font-body text-base leading-relaxed text-ink-soft">
            Full identity details are masked by default. Step-up authentication is required before
            viewing your full ID number or changing bank details.
          </p>
        </div>

        <div class="lg:col-span-7 flex flex-col gap-4">
          <!-- Marketing consent -->
          <div class="border border-line rounded-sm p-6 flex flex-col gap-3">
            <h2 class="font-heading text-3xl text-ink">Marketing consent</h2>
            <p class="font-body text-base leading-relaxed text-ink-soft">
              Control whether Kalahari may send you newsletters and credit-literacy updates. Every
              change is recorded in the append-only consent log.
            </p>
            <div class="flex items-center gap-4">
              <span class="inline-flex items-center gap-2 bg-surface-tint rounded-sm px-2.5 py-1.5">
                <span class="h-2 w-2 rounded-full" [class]="marketingGranted() ? 'bg-accent' : 'bg-line'"></span>
                <span class="font-caption text-xs font-bold text-ink">{{ marketingGranted() ? 'Granted' : 'Withdrawn' }}</span>
              </span>
              <button
                (click)="toggleConsent('MARKETING')"
                class="border border-line hover:border-accent text-ink font-caption text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
              >
                {{ marketingGranted() ? 'Withdraw consent' : 'Grant consent' }}
              </button>
            </div>
          </div>

          <!-- DSAR -->
          <div class="border border-line rounded-sm p-6 flex flex-col gap-3">
            <h2 class="font-heading text-3xl text-ink">Subject access request (DSAR)</h2>
            <p class="font-body text-base leading-relaxed text-ink-soft">
              Request a full export of the personal information we store — profile fields, consent
              logs, and voucher listings — as a POPIA data subject access request.
            </p>
            <button (click)="downloadData()" [disabled]="exporting()" class="${BUTTON} w-fit">
              {{ exporting() ? 'Compiling JSON…' : 'Download my personal data' }}
            </button>
          </div>
        </div>
      </div>
    </app-portal-shell>
  `,
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);

  consumerId = signal<string>('consumer-uuid');
  consumerName = signal<string>('Student member');

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
    this.http.get<any>(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}`).subscribe({
      next: (res) => {
        this.consumerName.set(`${res.firstName} ${res.lastName}`);
      },
    });
  }

  private fetchConsents() {
    this.http.get<Consent[]>(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}/consents`).subscribe({
      next: (list) => {
        const marketing = list.find((c) => c.consentType === 'MARKETING');
        this.marketingGranted.set(marketing?.status === 'GRANTED');
      },
    });
  }

  toggleConsent(type: string) {
    const targetStatus = this.marketingGranted() ? 'WITHDRAWN' : 'GRANTED';

    this.http.post(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}/consents`, {
      consentType: type,
      status: targetStatus,
      version: 'v1.0',
    }).subscribe({
      next: () => {
        this.marketingGranted.set(targetStatus === 'GRANTED');
      },
    });
  }

  downloadData() {
    this.exporting.set(true);
    this.http.get(`${environment.apiBaseUrl}/api/v1/consumers/${this.consumerId()}/data-export`).subscribe({
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
        this.exporting.set(false);
      },
    });
  }
}
