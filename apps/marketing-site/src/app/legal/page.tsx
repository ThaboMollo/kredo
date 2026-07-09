import React from 'react';
import PortalCTA from '@/components/PortalCTA';

export default function Legal() {
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
      <main className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-10 text-stone-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Legal Agreements & Policies</h1>
          <p className="text-stone-600 mt-2 text-sm">Last updated: July 9, 2026</p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">1. Privacy Policy & POPIA Statement</h2>
          <p className="text-sm leading-relaxed">
            In compliance with the South African Protection of Personal Information Act (POPIA), we are committed to protecting your privacy. We collect personal identifiers, including your full name, email, phone number, and South African Identity Number, solely for credit evaluation and identity verification purposes.
          </p>
          <p className="text-sm leading-relaxed font-semibold">
            All stored PII is encrypted at rest using AES-256-GCM. We maintain an append-only, auditable record of all consent decisions (granting and withdrawal) that you perform. You may request a complete export of your personal data or delete your account at any time within the profile settings.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">2. Terms of Service</h2>
          <p className="text-sm leading-relaxed">
            By registering for a Kalahari subscription or utilizing our Kredo credit facility, you agree to comply with our Terms of Service. Users are responsible for providing accurate academic enrollment and banking details.
          </p>
          <p className="text-sm leading-relaxed">
            Credit facility limits are dynamic and calculated using National Credit Act (NCA) affordability checks. On-time repayments are reported to major credit bureaus. Defaults or late payments will be reported as delinquent accounts, which could negatively impact your credit standing.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">3. PAIA Manual Disclosures</h2>
          <p className="text-sm leading-relaxed">
            In accordance with the Promotion of Access to Information Act (PAIA), Kalahari maintains record logs relating to corporate compliance, operating licenses, and consumer registers. Request procedures for records are handled by our designated Information Officer.
          </p>
        </section>
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
