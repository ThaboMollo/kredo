# 🛡️ Kredo Application Portal — Track Index

The Kredo application portal is a client-rendered single page application (CSR SPA) built on **Angular 22** utilizing zoneless change detection and Signal-based state management. It provides a secure environment for students to complete KYC processes, sign credit agreements, and draw down retail vouchers.

---

## 🛠️ Tech Stack Recap
* **Framework:** Angular 22 (Standalone Components, Zoneless, Signals)
* **Forms:** Signal Forms (for reactive, type-safe multi-step wizards)
* **Styling:** Angular CDK + Tailwind CSS (no heavyweight component suites)
* **Build tool:** Vite (default in Angular 22)
* **Testing:** Vitest & Playwright E2E

---

## 📂 Implementation Steps

Click on any step below to see its detailed step-by-step implementation plan:

1. **[Step 0: Portal Foundations & Angular Boilerplate](file:///Users/mollomponya/Documents/Dev/kredo/docs/app-portal/step-0-foundations.md)**
   * Boot Angular 22, disable Zone.js, configure routing modules, compile design system tokens, integrate Vitest, and configure build bundle budgets.
2. **[Step 1: Onboarding, KYC & Student Verification UI](file:///Users/mollomponya/Documents/Dev/kredo/docs/app-portal/step-1-onboarding.md)**
   * Capture incoming attribution parameters, construct the POPIA consent wizard, set up device camera hooks for FICA liveness checks, and build student enrollment document upload tools.
3. **[Step 2: Subscription & DebiCheck Authentication](file:///Users/mollomponya/Documents/Dev/kredo/docs/app-portal/step-2-money-rails.md)**
   * Construct the plan selector, build the DebiCheck mandate setup wizard, integrate real-time mandate confirmation webhooks, and launch the user dashboard shell.
4. **[Step 3: Affordability Wizard & Credit Signing](file:///Users/mollomponya/Documents/Dev/kredo/docs/app-portal/step-3-credit-wizard.md)**
   * Implement the Signal Forms-based s81 affordability input screens, display pre-agreement statement & quote, build OTP/Passkey verification, and enable credit agreement e-signing.
5. **[Step 4: Drawdowns & Voucher Viewer](file:///Users/mollomponya/Documents/Dev/kredo/docs/app-portal/step-4-drawdown-vouchers.md)**
   * Program the retail partner list, build drawdown amount validations against available credit limits, display voucher codes/QR details, and compile statement PDF downloads.
6. **[Step 5: Settings, Consents & Humane Arrears UI](file:///Users/mollomponya/Documents/Dev/kredo/docs/app-portal/step-5-arrears-and-profile.md)**
   * Build profile settings (consent withdrawal logs, account data requests), and design a humane arrears interface featuring debt restructuring options.

---

## 📂 Project Directory Structure

The Angular source directory is organized as follows:
```text
src/app/
├── core/            # Auth guards, HTTP interceptors, global state, money formatting
├── shared/          # Reusable design system, input components, custom pipes
└── features/        # Lazy-loaded feature routes
    ├── onboarding/
    ├── kyc/
    ├── application/
    ├── dashboard/
    ├── wallet/
    ├── drawdown/
    ├── repayments/
    ├── progress/
    └── profile/
```
