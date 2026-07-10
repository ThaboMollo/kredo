import { Component } from '@angular/core';
import { PortalShellComponent } from '../../shared/portal-shell';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [PortalShellComponent],
  template: `
    <app-portal-shell>
      <div class="flex flex-col gap-2">
        <span class="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">Bureau reporting</span>
        <h1 class="font-heading text-4xl md:text-5xl leading-[1.05] text-ink">Credit progress</h1>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        <div class="border border-line rounded-sm p-4.5 flex flex-col gap-1.5">
          <span class="font-caption text-xs font-bold text-ink-soft">Repayment consistency</span>
          <span class="font-heading text-3xl text-ink">100%</span>
          <span class="font-body text-[15px] text-ink-soft">All payments have been made on time.</span>
        </div>
        <div class="border border-line rounded-sm p-4.5 flex flex-col gap-1.5">
          <span class="font-caption text-xs font-bold text-ink-soft">Bureaus reported</span>
          <span class="font-heading text-3xl text-ink">TransUnion</span>
          <span class="font-body text-[15px] text-ink-soft">Files reported monthly on the 1st.</span>
        </div>
      </div>

      <div class="bg-ink rounded-sm p-8 flex flex-col gap-4 max-w-3xl">
        <span class="font-caption text-xs font-bold uppercase tracking-[0.14em] text-cream/70">Honest copy</span>
        <h2 class="font-heading text-3xl md:text-4xl leading-[1.05] text-cream">
          How Kredo helps you build credit
        </h2>
        <p class="font-body text-lg leading-relaxed text-cream/85">
          Every month that you keep your Kredo subscription active and repay any drawn voucher
          balances on time, we compile a status record and submit it to South African credit
          registries.
        </p>
        <p class="font-body text-lg leading-relaxed text-cream/85">
          We report behaviour; bureaus and score models decide the score. By maintaining positive
          behaviour you build an official financial profile that helps you qualify for home
          leases, auto finance, and corporate accounts without predatory rates.
        </p>
      </div>
    </app-portal-shell>
  `,
})
export class ProgressComponent {}
