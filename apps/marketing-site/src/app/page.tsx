import React from 'react';
import Image from 'next/image';
import PortalCTA from '@/components/PortalCTA';
import WaitlistForm from '@/components/WaitlistForm';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const trustLabels = [
  'POPIA consent first',
  'Credit-bureau reporting',
  'Transparent fees',
  'Campus partner ready',
];

const processSteps = [
  {
    number: '01',
    title: 'Subscribe',
    copy: 'Choose a plan and set up DebiCheck before credit is offered.',
  },
  {
    number: '02',
    title: 'Draw down',
    copy: 'Use closed-loop vouchers only within the approved facility.',
  },
  {
    number: '03',
    title: 'Build history',
    copy: 'Repay on time and have behaviour reported to bureaus.',
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col selection:bg-accent/20 selection:text-accent">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1698422454462-5ec4e767cd19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Students working together on campus"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 flex flex-col gap-6">
          <span className="font-caption text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-cream/80">
            Student credit without the loan-shark feel
          </span>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-cream max-w-4xl">
            Build real credit before graduation.
          </h1>
          <p className="font-body text-xl md:text-2xl leading-snug text-cream/90 max-w-xl">
            Kalahari helps students subscribe, qualify responsibly, draw down closed-loop vouchers,
            repay on time, and create a formal credit history the right way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <PortalCTA className="bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-4 rounded-sm text-center transition-opacity">
              Start in Kredo
            </PortalCTA>
            <a
              href="/how-it-works"
              className="bg-cream/95 hover:bg-cream text-ink font-caption text-sm font-semibold px-6 py-4 rounded-sm text-center transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Trust label row */}
      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
          {trustLabels.map((label) => (
            <span
              key={label}
              className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-ink-soft"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="learn-more" className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 flex flex-col gap-5">
          <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
            How it works
          </span>
          <h2 className="font-heading text-4xl md:text-5xl leading-[1.02] text-ink">
            A subscription path into formal credit.
          </h2>
          <p className="font-body text-xl leading-relaxed text-ink-soft">
            Students activate a plan, complete consent and verification, then use approved vouchers
            at partner retailers. Repayments and behaviour are recorded for bureau reporting, with
            plain-language compliance at every step.
          </p>
        </div>
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-5">
          {processSteps.map((step) => (
            <div key={step.number} className="border border-line rounded-sm p-5 flex flex-col gap-2.5">
              <span className="font-caption text-xs font-bold text-accent">{step.number}</span>
              <h3 className="font-heading text-3xl leading-[1.05] text-ink">{step.title}</h3>
              <p className="font-body text-lg leading-snug text-ink-soft">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & compliance */}
      <section className="max-w-7xl mx-auto px-6 pb-20 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 relative aspect-[13/9] w-full">
          <Image
            src="https://images.unsplash.com/photo-1574420773965-b34c687f35b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Compliance documents on a workspace"
            fill
            className="object-cover"
          />
        </div>
        <div className="lg:col-span-7 flex flex-col gap-5">
          <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Trust &amp; compliance
          </span>
          <h2 className="font-heading text-4xl md:text-5xl leading-[1.02] text-ink">
            Built for a credit-anxious audience.
          </h2>
          <p className="font-body text-xl leading-relaxed text-ink-soft">
            The public site explains NCR registration, POPIA handling, fee transparency, complaints
            paths, and the difference between reported behaviour and guaranteed score changes. No
            login lives here; qualified intent moves to Kredo.
          </p>
        </div>
      </section>

      {/* Lead capture slab */}
      <section className="bg-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-cream/70">
              Waitlist handoff
            </span>
            <h2 className="font-heading text-4xl md:text-5xl leading-[1.05] text-cream">
              Capture demand now. Complete applications in Kredo.
            </h2>
            <p className="font-body text-xl leading-relaxed text-cream/85">
              The form records granular POPIA consent and referral attribution, then sends
              applicants to kredo.kalahari.co.za/apply with campaign data intact.
            </p>
          </div>
          <div className="lg:col-span-5">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
