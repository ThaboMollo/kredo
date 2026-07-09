# Step 0 — Portal Foundations & Angular Boilerplate

This step bootstraps the Angular project, configures zoneless change detection, defines the core routing structure, configures bundle budgets, and sets up OpenAPI client generation.

---

## 🎯 Objectives
* Boot an Angular 22 standalone project.
* Enable zoneless change detection using experimental features.
* Configure Tailwind CSS and Angular CDK.
* Establish standard file directories: `core`, `shared`, `features`.
* Scaffold lazy-loaded standalone routes.
* Configure bundle budgets and integrate Vitest.
* Set up `ng-openapi-gen` for backend contract generation.

---

## 🔨 Tasks & Sub-Tasks

### 1. Angular Framework Bootstrapping
- [ ] Initialize the project: `npx -y @angular/cli new kredo-portal --style css --routing --standalone`
- [ ] Remove `zone.js` dependency from `package.json` and `angular.json` polyfills list.
- [ ] Configure `src/app/app.config.ts` to include `provideExperimentalZonelessChangeDetection()`.
- [ ] Ensure `tsconfig.json` has strict validation flags enabled.

### 2. Styling & Angular CDK
- [ ] Configure Tailwind CSS in `kredo-portal`.
- [ ] Install Angular CDK: `npm install @angular/cdk`.
- [ ] Implement foundational CDK layouts (e.g. dynamic overlays, scroll wrappers, accessibility helpers) instead of importing a heavy Material Design UI framework.

### 3. Core Routing & Structural Directories
- [ ] Create folder structures inside `src/app/`: `core/`, `shared/`, `features/`.
- [ ] Define routes in `src/app/app.routes.ts` as dynamic imports to enforce route-level lazy loading, e.g.:
  ```typescript
  export const routes: Routes = [
    {
      path: 'apply',
      loadComponent: () => import('./features/onboarding/onboarding.component').then(c => c.OnboardingComponent)
    }
  ];
  ```

### 4. OpenAPI Client Generation
- [ ] Install generator utility: `npm install -D ng-openapi-gen`.
- [ ] Create a configuration file `ng-openapi-gen.json` pointing to the backend's exposed Swagger API endpoint.
- [ ] Add a script block in `package.json`: `"generate-client": "ng-openapi-gen --input http://localhost:3000/api/openapi.json --output src/app/core/api"`.
- [ ] Setup standard HTTP Client loading in `app.config.ts` using `provideHttpClient()` and wire interceptors (for API error mapping and bearer tokens).

### 5. Testing & Bundle Budgets
- [ ] Configure `vitest` for fast component execution testing.
- [ ] Define bundle size warning and error budgets inside `angular.json` under configurations > production:
  * Initial bundle: Warning at `200KB`, Error at `350KB`.

---

## 🏛️ Code Structure Draft (`app.config.ts`)

```typescript
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

---

## 🔍 Verification Plan

### Automated Tests
* **Zoneless Operation Test:** Run the application shell, perform a state change using a Signal, and assert that change detection occurs without `zone.js` active in the window object.
* **OpenAPI Client Compilation Test:** Run `npm run generate-client` and assert that strongly-typed models (e.g. `ConsumerDto`, `VoucherDto`) are generated without TypeScript syntax warnings.
* **Bundle Budget CI Test:** Run `npm run build` and verify the compilation completes without exceeding the initial bundle budgets.

### Manual Verification
* Run the portal application, open Chrome DevTools console, and verify that no console logs alert regarding missing Polyfills or zone hooks.
