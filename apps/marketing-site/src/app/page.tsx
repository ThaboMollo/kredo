import React from 'react';
import PortalCTA from '@/components/PortalCTA';
import WaitlistForm from '@/components/WaitlistForm';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 bg-[#faf8f5]/85 backdrop-blur-md border-b border-stone-200/60 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-stone-900">
              Kalahari<span className="text-primary">.</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <a href="/how-it-works" className="hover:text-stone-900 transition-colors">How it works</a>
            <a href="/pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
            <a href="/trust" className="hover:text-stone-900 transition-colors">Trust & Compliance</a>
          </nav>
          <div className="flex items-center gap-4">
            <PortalCTA className="text-sm font-semibold text-stone-700 hover:text-stone-900 px-4 py-2">
              Sign In
            </PortalCTA>
            <PortalCTA className="bg-primary hover:bg-primary/95 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
              Apply Now
            </PortalCTA>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold w-fit uppercase tracking-wider">
            Student Credit Redefined
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Build your credit history <span className="text-primary underline decoration-wavy decoration-accent/40">before</span> you graduate.
          </h1>
          <p className="text-lg text-stone-600 max-w-xl leading-relaxed">
            South African students are locked out of the financial system or trapped by predatory loan sharks. Kalahari offers a simple subscription-based retail facility that builds your official bureau history safely and transparently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <PortalCTA className="bg-primary hover:bg-primary/95 text-white font-bold px-8 py-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all">
              Get Started
            </PortalCTA>
            <a href="#learn-more" className="border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold px-8 py-4 rounded-xl text-center transition-all">
              See How It Works
            </a>
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center">
          <WaitlistForm />
        </div>
      </section>

      {/* Steps Section */}
      <section id="learn-more" className="bg-stone-100/50 py-20 px-6 border-t border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">How Kalahari works in 3 steps</h2>
            <p className="text-stone-600">No complicated forms, no high-interest loan shark traps. Just structured progress.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-stone-200/60 rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">1</div>
              <h3 className="text-xl font-bold text-stone-900">Choose a Plan</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Verify your student status and select a pricing plan. Setup your DebiCheck automated debit order mandate with your SA bank account.
              </p>
            </div>

            <div className="bg-white border border-stone-200/60 rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">2</div>
              <h3 className="text-xl font-bold text-stone-900">Voucher Drawdowns</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Access a credit facility for closed-loop vouchers at partner retailers. Purchase essential academic books, food, or electronics within your approved limits.
              </p>
            </div>

            <div className="bg-white border border-stone-200/60 rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">3</div>
              <h3 className="text-xl font-bold text-stone-900">Bureaus Reporting</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Repay your balances on time. We compile and report your positive repayment behaviors to South Africa’s leading credit bureaus, growing your credit profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-16 px-6 max-w-7xl mx-auto text-center flex flex-col gap-6">
        <h3 className="text-2xl font-bold text-stone-900">Your financial safety is our legal mandate.</h3>
        <p className="text-stone-600 max-w-2xl mx-auto text-sm leading-relaxed">
          Kalahari conforms strictly to the National Credit Act (NCA) guidelines. We run strict affordability checks and audit all consents under POPIA rules. All personal identifiers are encrypted at rest.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 mt-4 text-xs font-semibold text-stone-500 uppercase tracking-widest">
          <span>NCR Registered Provider</span>
          <span className="hidden sm:inline">•</span>
          <span>POPIA Compliant</span>
          <span className="hidden sm:inline">•</span>
          <span>DebiCheck Certified</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-6 border-t border-stone-850 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-lg font-bold text-white">
            Kalahari<span className="text-primary">.</span>
          </span>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
            <a href="/legal" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/legal" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/trust" className="hover:text-white transition-colors">NCR Information</a>
          </div>
          <p className="text-xs text-stone-500">© 2026 Kalahari. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
