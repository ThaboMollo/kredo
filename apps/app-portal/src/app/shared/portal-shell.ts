import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-portal-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-surface text-ink flex flex-col md:flex-row antialiased">
      <!-- Portal Sidebar -->
      <aside class="w-full md:w-[270px] shrink-0 bg-ink text-cream px-6 py-9 flex flex-col gap-7">
        <a routerLink="/dashboard" class="font-heading text-4xl text-cream">Kredo</a>

        <nav class="flex flex-col gap-2.5 flex-1">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-cream/10 !text-cream"
              class="flex items-center h-[42px] px-3 rounded-sm font-caption text-[13px] font-bold text-cream/60 hover:text-cream transition-colors"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="border border-cream/20 rounded-sm p-4 flex flex-col gap-2">
          <span class="font-caption text-[11px] font-bold uppercase tracking-[0.12em] text-cream/60">
            Application status
          </span>
          <span class="font-heading text-2xl text-cream">{{ status() }}</span>
        </div>

        <button
          (click)="logout()"
          class="text-left font-caption text-xs font-bold text-cream/60 hover:text-cream transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </aside>

      <!-- Main workspace -->
      <main class="flex-1 flex flex-col gap-6 p-6 md:p-10">
        <ng-content></ng-content>
      </main>
    </div>
  `,
})
export class PortalShellComponent {
  private router = inject(Router);

  status = input<string>('Getting started');

  navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/apply', label: 'Apply' },
    { path: '/wallet', label: 'Vouchers' },
    { path: '/repayments', label: 'Repayments' },
    { path: '/progress', label: 'Credit progress' },
    { path: '/profile', label: 'Profile' },
  ];

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/apply']);
  }
}
