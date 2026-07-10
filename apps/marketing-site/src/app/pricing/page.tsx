import React from 'react';
import Image from 'next/image';
import PortalCTA from '@/components/PortalCTA';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const plans = [
  {
    name: 'Starter',
    price: 'R49 / month',
    copy: 'For students preparing their profile before applying.',
    included: 'Waitlist, money guides, eligibility prompts',
    highlighted: false,
  },
  {
    name: 'Builder',
    price: 'R99 / month',
    copy: 'For verified students ready for bureau-reportable behaviour.',
    included: 'DebiCheck mandate, facility review, voucher access',
    highlighted: true,
  },
  {
    name: 'Campus',
    price: 'Custom',
    copy: 'For SRCs, residences, and retailer partnerships.',
    included: 'Lead routing, ambassador codes, partner reporting',
    highlighted: false,
  },
];

const complianceChecklist = [
  'NCR registration number and renewal note',
  'POPIA consent purposes with withdrawal path',
  'FAQPage structured data for trust content',
  'Plain-language warning: reporting does not guarantee score changes',
  'Legal document links: terms, privacy, PAIA, cookies',
];

const faqs = [
  'How does Kalahari help build credit history?',
  'What happens if I miss a repayment?',
  'Where do applications continue after the public site?',
];

export default function Pricing() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex flex-col">
        {/* Pricing header */}
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
              Transparent by design
            </span>
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.02] text-ink">
              Fees should be easy to compare before a student commits.
            </h1>
            <p className="font-body text-xl leading-relaxed text-ink-soft">
              Kalahari separates subscription, facility, voucher drawdown, and repayment
              obligations in plain language. The final quote and agreement still come from the
              regulated Kredo backend.
            </p>
          </div>
          <div className="lg:col-span-5 relative aspect-[4/3] w-full">
            <Image
              src="https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Student comparing plans on a laptop"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* Plan comparison */}
        <section className="max-w-7xl mx-auto w-full px-6 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border border-line rounded-sm p-6 flex flex-col gap-4 ${
                plan.highlighted ? 'bg-surface-tint' : 'bg-surface'
              }`}
            >
              <span className="font-caption text-sm font-bold text-accent">{plan.name}</span>
              <div className="font-heading text-4xl text-ink">{plan.price}</div>
              <p className="font-body text-xl leading-snug text-ink-soft">{plan.copy}</p>
              <p className="font-caption text-sm leading-relaxed text-ink">{plan.included}</p>
              <PortalCTA className="mt-auto bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-5 py-3 rounded-sm text-center transition-opacity">
                Continue in Kredo
              </PortalCTA>
            </div>
          ))}
        </section>

        {/* Compliance detail slab */}
        <section className="bg-ink">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-6 flex flex-col gap-5">
              <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-cream/70">
                Before launch
              </span>
              <h2 className="font-heading text-4xl md:text-5xl leading-[1.05] text-cream">
                Surface the NCR, POPIA, complaints, and bureau-reporting story.
              </h2>
              <p className="font-body text-xl leading-relaxed text-cream/85">
                The trust page should make registration status, privacy handling, fee caps, legal
                documents, and escalation paths visible before students are asked to apply.
              </p>
            </div>
            <ul className="lg:col-span-6 flex flex-col gap-4">
              {complianceChecklist.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  <span className="font-body text-xl text-cream">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ preview */}
        <section className="max-w-7xl mx-auto w-full px-6 py-14 flex flex-col gap-5">
          <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
            FAQ structured data
          </span>
          {faqs.map((question) => (
            <a
              key={question}
              href="/how-it-works"
              className="flex items-center justify-between gap-6 border-b border-line pb-3 group"
            >
              <span className="font-heading text-2xl md:text-3xl text-ink group-hover:text-accent transition-colors">
                {question}
              </span>
              <span className="font-caption text-2xl text-accent">+</span>
            </a>
          ))}
          <p className="font-caption text-xs text-ink-soft leading-relaxed max-w-3xl mt-4">
            All pricing options are subject to National Credit Act (NCA) affordability assessments.
            Credit facility activation is not guaranteed and requires FICA identity verification.
            Initiation and service fees do not exceed NCA-mandated maximums.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
