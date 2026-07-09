import React from 'react';
import PortalCTA from '@/components/PortalCTA';

export default function Pricing() {
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
            <a href="/trust" className="hover:text-stone-900 transition-colors">Trust & Compliance</a>
          </nav>
          <PortalCTA className="bg-primary hover:bg-primary/95 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
            Apply Now
          </PortalCTA>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">Simple, Transparent Pricing</h1>
          <p className="text-lg text-stone-600">We differentiate ourselves by charging no hidden compound interest fees. Choose a plain subscription plan.</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Card 1 */}
          <div className="bg-white border-2 border-stone-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-primary transition-all">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Basic Plan</span>
              <div className="flex items-baseline gap-1 text-stone-900">
                <span className="text-4xl font-bold">R59</span>
                <span className="text-sm font-medium text-stone-500">/ month</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900">Starter Facility</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Perfect for managing smaller academic expenses while consistently accumulating credit reporting files.
              </p>
              <hr className="border-stone-100 my-2" />
              <ul className="text-stone-600 text-sm flex flex-col gap-2">
                <li className="flex items-center gap-2">✓ Approved facility limit up to <strong>R1 500</strong></li>
                <li className="flex items-center gap-2">✓ Monthly bureau reporting</li>
                <li className="flex items-center gap-2">✓ Automated DebiCheck payments</li>
              </ul>
            </div>
            <PortalCTA className="w-full bg-primary hover:bg-primary/95 text-white text-center font-semibold py-3 px-4 rounded-xl transition-all shadow-sm mt-8">
              Select Basic
            </PortalCTA>
          </div>

          {/* Card 2 */}
          <div className="bg-white border-2 border-primary rounded-3xl p-8 shadow-md flex flex-col justify-between relative">
            <span className="absolute -top-3 right-8 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </span>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Premium Plan</span>
              <div className="flex items-baseline gap-1 text-stone-900">
                <span className="text-4xl font-bold">R99</span>
                <span className="text-sm font-medium text-stone-500">/ month</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900">Advanced Facility</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Designed for students requiring larger voucher limits for books, laptops, or grocery support.
              </p>
              <hr className="border-stone-100 my-2" />
              <ul className="text-stone-600 text-sm flex flex-col gap-2">
                <li className="flex items-center gap-2">✓ Approved facility limit up to <strong>R3 500</strong></li>
                <li className="flex items-center gap-2">✓ Priority bureau reporting updates</li>
                <li className="flex items-center gap-2">✓ Customized repayment terms</li>
              </ul>
            </div>
            <PortalCTA className="w-full bg-primary hover:bg-primary/95 text-white text-center font-semibold py-3 px-4 rounded-xl transition-all shadow-sm mt-8">
              Select Premium
            </PortalCTA>
          </div>
        </div>

        {/* Regulatory Disclosures */}
        <div className="bg-stone-100/80 rounded-2xl p-6 text-center text-stone-500 text-xs mt-6 leading-relaxed max-w-3xl mx-auto border border-stone-200/50">
          All pricing options are subject to the National Credit Act (NCA) affordability assessments. Credit facility activation is not guaranteed and requires FICA identity verification. In accordance with South African regulations, initiation and service fees do not exceed NCA-mandated maximums.
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
