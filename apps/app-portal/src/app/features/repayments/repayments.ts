import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PortalShellComponent } from '../../shared/portal-shell';
import { environment } from '../../../environments/environment';

const LABEL = 'font-caption text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft';
const BUTTON =
  'bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-3.5 rounded-sm transition-opacity cursor-pointer disabled:opacity-50';

@Component({
  selector: 'app-repayments',
  standalone: true,
  imports: [CommonModule, PortalShellComponent],
  template: `
    <app-portal-shell>
      <div class="flex flex-col gap-2">
        <span class="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">On-time behaviour builds history</span>
        <h1 class="font-heading text-4xl md:text-5xl leading-[1.05] text-ink">Repayments</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- DebiCheck schedule -->
        <div class="lg:col-span-6 bg-surface-tint rounded-sm p-7 flex flex-col gap-4">
          <h2 class="font-heading text-3xl text-ink">Scheduled collection</h2>
          <p class="font-body text-lg leading-relaxed text-ink-soft">
            Your DebiCheck mandate collects the subscription fee and any drawn balance
            automatically each month. Successful collections are recorded to the ledger and count
            toward your bureau-reported behaviour.
          </p>
          <div class="bg-surface border-l-[3px] border-accent p-4">
            <p class="font-body text-base leading-snug text-ink-soft">
              Collections run on your billing date. If a collection fails, you enter a grace
              window before any arrears process starts — humane by design.
            </p>
          </div>
        </div>

        <!-- Pay now -->
        <div class="lg:col-span-6 flex flex-col gap-4">
          <div class="border border-line rounded-sm p-6 flex flex-col gap-3">
            <h2 class="font-heading text-3xl text-ink">Pay now</h2>
            <p class="font-body text-base leading-relaxed text-ink-soft">
              Settle ahead of your DebiCheck date with an instant card or EFT payment. The sandbox
              posts a R500 repayment straight to the ledger.
            </p>
            @if (paid()) {
              <span class="inline-flex items-center gap-2 bg-surface-tint rounded-sm px-2.5 py-1.5 w-fit">
                <span class="h-2 w-2 rounded-full bg-accent"></span>
                <span class="font-caption text-xs font-bold text-ink">Repayment posted to ledger</span>
              </span>
            }
            <button (click)="payNowMock()" [disabled]="paying()" class="${BUTTON} w-fit">
              {{ paying() ? 'Processing…' : 'Pay R500 now (sandbox)' }}
            </button>
          </div>

          <div class="border border-line rounded-sm p-6 flex flex-col gap-3">
            <h2 class="font-heading text-3xl text-ink">Monthly statements</h2>
            <p class="font-body text-base text-ink-soft">
              No billing statements generated yet. Statements compile monthly.
            </p>
          </div>
        </div>
      </div>
    </app-portal-shell>
  `,
})
export class RepaymentsComponent implements OnInit {
  private http = inject(HttpClient);

  consumerId = signal<string>('consumer-uuid');
  paying = signal(false);
  paid = signal(false);

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
            this.paid.set(true);
          },
          error: () => this.paying.set(false),
        });
      },
      error: () => this.paying.set(false),
    });
  }
}
