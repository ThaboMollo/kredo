import React from 'react';
import PortalCTA from '@/components/PortalCTA';

export default function HowItWorks() {
  return (
    <div className="flex-1 flex flex-col font-sans bg-[#faf8f5]">
      {/* Header */}
      <header className="sticky top-0 bg-[#faf8f5]/85 backdrop-blur-md border-b border-stone-200/60 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight text-stone-900">
            Kalahari<span className="text-primary">.</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <a href="/" className="hover:text-stone-900 transition-colors">Home</a>
            <a href="/pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
            <a href="/trust" className="hover:text-stone-900 transition-colors">Trust & Compliance</a>
          </nav>
          <PortalCTA className="bg-primary hover:bg-primary/95 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
            Apply Now
          </PortalCTA>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">How Kalahari Credit Works</h1>
          <p className="text-lg text-stone-600">A clear, structured walkthrough of how we help you build credit history safely.</p>
        </div>

        {/* Detailed Timeline */}
        <div className="flex flex-col gap-10 mt-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 font-bold text-2xl text-primary">01. Enlist & Consent</div>
            <div className="md:w-2/3 flex flex-col gap-2">
              <h3 className="text-xl font-bold text-stone-900">Sign Up & Complete FICA</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Register on Kredo and verify your identity using our Web KYC liveness check. We request explicit POPIA consent before querying credit bureaus or reporting behavior.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 font-bold text-2xl text-primary">02. Setup Mandate</div>
            <div className="md:w-2/3 flex flex-col gap-2">
              <h3 className="text-xl font-bold text-stone-900">DebiCheck Debit Order</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Choose a plan and authenticate a DebiCheck debit mandate on your banking application. This ensures payments occur on time, automatically preserving your positive profile.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 font-bold text-2xl text-primary">03. Spend Closed-Loop</div>
            <div className="md:w-2/3 flex flex-col gap-2">
              <h3 className="text-xl font-bold text-stone-900">Retailer Voucher Drawdowns</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Draw down closed-loop vouchers at partner stores (e.g. food, textbooks, stationery). All drawdowns are validated against your active affordability limit.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 font-bold text-2xl text-primary">04. Grow History</div>
            <div className="md:w-2/3 flex flex-col gap-2">
              <h3 className="text-xl font-bold text-stone-900">Monthly Bureau Reporting</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                We report your payment behaviors on the first of each month. Your consistent, on-time performance builds a credit record, opening doors for housing, vehicle financing, and professional careers post-graduation.
              </p>
            </div>
          </div>
        </div>

        {/* Action CTA */}
        <div className="bg-stone-900 text-white rounded-3xl p-10 text-center flex flex-col items-center gap-6 mt-6 shadow-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold">Ready to build your financial future?</h2>
          <p className="text-stone-400 text-sm max-w-lg leading-relaxed">
            Join thousands of South African students taking charge of their credit history. Register in less than 5 minutes.
          </p>
          <PortalCTA className="bg-primary hover:bg-primary/95 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all">
            Open Kredo Account
          </PortalCTA>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 px-6 border-t border-stone-850 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <span>Kalahari.</span>
          <p>© 2026 Kalahari. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
