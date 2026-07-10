import { Component, input } from '@angular/core';

export const WIZARD_STEPS = [
  'Consent',
  'KYC / FICA',
  'Subscription',
  'Affordability',
  'Quote',
  'Agreement',
] as const;

@Component({
  selector: 'app-wizard-shell',
  standalone: true,
  template: `
    <div class="min-h-screen bg-surface text-ink flex flex-col lg:flex-row antialiased">
      <!-- Wizard progress rail -->
      <aside class="w-full lg:w-[330px] shrink-0 bg-ink text-cream px-8 py-11 flex flex-col gap-7">
        <div class="flex flex-col gap-2">
          <span class="font-heading text-4xl text-cream">Kredo</span>
          <span class="font-caption text-xs font-bold uppercase tracking-[0.12em] text-cream/60">
            Application workflow
          </span>
        </div>

        <div class="flex flex-col gap-6">
          @for (step of steps; track step; let i = $index) {
            <div class="flex items-center gap-3.5">
              <div
                class="h-[38px] w-[38px] shrink-0 rounded-sm flex items-center justify-center font-caption text-xs font-bold"
                [class]="i + 1 === active() ? 'bg-accent text-cream' : 'bg-cream/10 text-cream'"
              >
                {{ (i + 1 < 10 ? '0' : '') + (i + 1) }}
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="font-body text-xl text-cream">{{ step }}</span>
                <span class="font-caption text-[11px] font-bold uppercase tracking-[0.1em] text-cream/60">
                  {{ i + 1 < active() ? 'Complete' : i + 1 === active() ? 'In progress' : 'Up next' }}
                </span>
              </div>
            </div>
          }
        </div>
      </aside>

      <!-- Wizard content -->
      <main class="flex-1 flex flex-col gap-6 p-6 md:p-10">
        <div class="flex flex-col gap-2 max-w-3xl">
          <span class="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
            {{ eyebrow() }}
          </span>
          <h1 class="font-heading text-4xl md:text-5xl leading-[1.05] text-ink">{{ heading() }}</h1>
        </div>
        <ng-content></ng-content>
      </main>
    </div>
  `,
})
export class WizardShellComponent {
  active = input.required<number>();
  eyebrow = input<string>('');
  heading = input<string>('');

  steps = WIZARD_STEPS;
}
