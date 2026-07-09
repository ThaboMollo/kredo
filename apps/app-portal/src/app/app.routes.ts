import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'apply',
    loadComponent: () => import('./features/onboarding/onboarding').then(m => m.OnboardingComponent),
  },
  {
    path: 'subscribe',
    loadComponent: () => import('./features/subscription/subscription').then(m => m.SubscriptionComponent),
  },
  {
    path: 'credit',
    loadComponent: () => import('./features/credit/credit').then(m => m.CreditComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
  },
  {
    path: 'wallet',
    loadComponent: () => import('./features/wallet/wallet').then(m => m.WalletComponent),
  },
  {
    path: 'repayments',
    loadComponent: () => import('./features/repayments/repayments').then(m => m.RepaymentsComponent),
  },
  {
    path: 'progress',
    loadComponent: () => import('./features/progress/progress').then(m => m.ProgressComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent),
  },
  {
    path: '',
    redirectTo: 'apply',
    pathMatch: 'full',
  }
];

