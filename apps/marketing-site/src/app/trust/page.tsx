import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const pillars = [
  {
    title: 'National Credit Regulator (NCR)',
    copy: 'We are registering as an authorised credit provider under National Credit Regulator rules. We enforce statutory fee caps and interest rate restrictions.',
  },
  {
    title: 'POPIA data protection',
    copy: 'In accordance with the Protection of Personal Information Act, all customer identifiers are encrypted at rest. Consent changes are recorded in an immutable log with a clear withdrawal path.',
  },
  {
    title: 'Affordability guidelines',
    copy: 'Every facility is subject to Section 81 of the National Credit Act, validating disposable income against declared expenditure to prevent reckless lending.',
  },
  {
    title: 'Complaints handling',
    copy: 'Students have direct access to a dispute-resolution pipeline. Matters can be escalated to the Credit Ombud and the National Credit Regulator if unresolved.',
  },
];

export default function TrustAndCompliance() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex flex-col">
        <section className="max-w-7xl mx-auto w-full px-6 py-16 md:py-20">
          <div className="max-w-3xl flex flex-col gap-5">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
              Trust &amp; compliance
            </span>
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.02] text-ink">
              We operate with complete regulatory oversight.
            </h1>
            <p className="font-body text-xl leading-relaxed text-ink-soft">
              Registration status, privacy handling, fee caps, legal documents, and escalation paths
              — visible before students are asked to apply. Reporting behaviour to bureaus does not
              guarantee score changes; score models make that decision.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto w-full px-6 pb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="border border-line rounded-sm p-7 flex flex-col gap-3">
              <h2 className="font-heading text-3xl leading-[1.05] text-ink">{pillar.title}</h2>
              <p className="font-body text-lg leading-relaxed text-ink-soft">{pillar.copy}</p>
            </div>
          ))}
        </section>

        {/* Responsible lending slab */}
        <section className="bg-ink">
          <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col gap-4">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-cream/70">
              Responsible lending pledge
            </span>
            <h2 className="font-heading text-4xl leading-[1.05] text-cream max-w-3xl">
              Our incentives are aligned with your success.
            </h2>
            <p className="font-body text-xl leading-relaxed text-cream/85 max-w-3xl">
              Unlike micro-lenders who profit from rollover fees and default penalties, Kalahari
              reports positive payment records so you can build formal credit standing. If you
              default, we suspend the facility immediately to prevent debt accumulation.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
