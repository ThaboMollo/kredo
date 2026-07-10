import React from 'react';
import PortalCTA from '@/components/PortalCTA';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const journeySteps = [
  {
    number: '01',
    title: 'Enlist & consent',
    heading: 'Sign up and complete FICA',
    copy: 'Register on Kredo and verify your identity using our web KYC liveness check. We request explicit POPIA consent before querying credit bureaus or reporting behaviour.',
  },
  {
    number: '02',
    title: 'Set up mandate',
    heading: 'DebiCheck debit order',
    copy: 'Choose a plan and authenticate a DebiCheck debit mandate in your banking app. Payments happen on time, automatically preserving your positive profile.',
  },
  {
    number: '03',
    title: 'Spend closed-loop',
    heading: 'Retailer voucher drawdowns',
    copy: 'Draw down closed-loop vouchers at partner stores — food, textbooks, stationery. All drawdowns are validated against your active affordability limit.',
  },
  {
    number: '04',
    title: 'Grow history',
    heading: 'Monthly bureau reporting',
    copy: 'We report your payment behaviour on the first of each month. Consistent, on-time performance builds a credit record for housing, vehicle finance, and careers after graduation.',
  },
];

export default function HowItWorks() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex flex-col">
        <section className="max-w-7xl mx-auto w-full px-6 py-16 md:py-20">
          <div className="max-w-3xl flex flex-col gap-5">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
              The journey
            </span>
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.02] text-ink">
              How Kalahari credit works.
            </h1>
            <p className="font-body text-xl leading-relaxed text-ink-soft">
              A clear, structured walkthrough of how we help you build credit history safely — from
              consent to bureau reporting.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto w-full px-6 pb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {journeySteps.map((step) => (
            <div key={step.number} className="border border-line rounded-sm p-7 flex flex-col gap-3">
              <span className="font-caption text-xs font-bold text-accent">
                {step.number} · {step.title.toUpperCase()}
              </span>
              <h2 className="font-heading text-3xl leading-[1.05] text-ink">{step.heading}</h2>
              <p className="font-body text-lg leading-relaxed text-ink-soft">{step.copy}</p>
            </div>
          ))}
        </section>

        {/* Handoff CTA slab */}
        <section className="bg-ink">
          <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-start gap-5">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-cream/70">
              Ready when you are
            </span>
            <h2 className="font-heading text-4xl md:text-5xl leading-[1.05] text-cream max-w-3xl">
              Ready to build your financial future?
            </h2>
            <p className="font-body text-xl leading-relaxed text-cream/85 max-w-2xl">
              Join South African students taking charge of their credit history. Register in less
              than five minutes — the application itself continues in Kredo.
            </p>
            <PortalCTA className="bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-4 rounded-sm transition-opacity">
              Open Kredo account
            </PortalCTA>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
