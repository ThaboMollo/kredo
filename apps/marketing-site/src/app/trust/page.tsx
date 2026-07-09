import React from 'react';
import PortalCTA from '@/components/PortalCTA';

export default function TrustAndCompliance() {
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
            <a href="/how-it-works" className="hover:text-stone-900 transition-colors">How it works</a>
            <a href="/pricing" className="hover:text-stone-900 transition-colors">Pricing</a>
          </nav>
          <PortalCTA className="bg-primary hover:bg-primary/95 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
            Apply Now
          </PortalCTA>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-10">
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">Trust & Legal Compliance</h1>
          <p className="text-lg text-stone-600">We operate with complete regulatory oversight to protect our student members.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-lg font-bold text-stone-900">National Credit Regulator (NCR)</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              We are registering as an authorized credit provider under the National Credit Regulator rules. We enforce statutory fee caps and interest rate restrictions.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-lg font-bold text-stone-900">POPIA Data Protection</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              In accordance with the Protection of Personal Information Act (POPIA), all customer identifiers are encrypted at rest. We record consent changes in an immutable log.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-lg font-bold text-stone-900">Affordability Guidelines</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Every facility setup is subject to Section 81 of the National Credit Act, validating disposable income against declared expenditures to prevent reckless lending.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-lg font-bold text-stone-900">Complaints Handling</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Students have direct access to a dispute resolution pipeline. Matters can be escalated to the Credit Ombud and National Credit Regulator if unresolved.
            </p>
          </div>
        </div>

        {/* Legal disclosures banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex flex-col gap-3 text-stone-800">
          <h4 className="font-bold text-lg">⚠️ Responsible Lending Pledge</h4>
          <p className="text-sm leading-relaxed">
            Unlike micro-lenders who benefit from rollover fees and default penalties, Kalahari has structured incentives aligned with your success: we report positive payment records so you can build formal credit standing. If you default, we suspend the facility immediately to prevent debt accumulation.
          </p>
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
