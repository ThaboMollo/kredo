import React from 'react';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Solutions — Kalahari Technology Holdings',
  description:
    'POS and payment systems, enterprise inventory and supply chain integration, contactless hospitality and networking, and custom platform development.',
};

const practices = [
  {
    number: '01',
    eyebrow: 'Point of sale & payment systems',
    heading: 'Cashless environments, built end to end.',
    offerings: [
      {
        title: 'Digital account infrastructure',
        copy: 'We design and implement custom POS environments — such as transitioning school tuckshops to fully digital, cashless student account systems.',
      },
      {
        title: 'Hardware solutions',
        copy: 'We supply enterprise-grade POS and inventory hardware, operating as a reseller for brands like Zebra.',
      },
    ],
  },
  {
    number: '02',
    eyebrow: 'Enterprise inventory & supply chain integration',
    heading: 'Portals that speak to your warehouse.',
    offerings: [
      {
        title: 'EWM system integration',
        copy: 'Buyer and inventory integration portals that connect directly with existing Enterprise Warehouse Management systems to streamline sales and returns processes.',
      },
      {
        title: 'Advanced tracking',
        copy: 'GS1 2D-QR and RFID technology implementations that enhance supply chain efficiency, visibility, and warehouse management logic.',
      },
    ],
  },
  {
    number: '03',
    eyebrow: 'Contactless hospitality & networking',
    heading: 'Tap-and-go experiences for guests and professionals.',
    offerings: [
      {
        title: 'Kalahari digital menus',
        copy: 'We equip independent restaurants with NFC and QR code technology to provide seamless, contactless digital menus.',
      },
      {
        title: 'Digital business cards',
        copy: 'Modern, tech-enabled networking tools using NFC and QR technology for professionals and businesses.',
      },
    ],
  },
  {
    number: '04',
    eyebrow: 'Custom platform development',
    heading: 'Software shaped around your operation.',
    offerings: [
      {
        title: 'Tailored software solutions',
        copy: 'Custom web platforms that address specific operational needs — such as dedicated online ticketing platforms for content creators and events, or Kredo, our regulated student credit platform.',
      },
    ],
  },
];

export default function Solutions() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="flex flex-col">
        <section className="max-w-7xl mx-auto w-full px-6 py-16 md:py-20">
          <div className="max-w-3xl flex flex-col gap-5">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
              Solutions
            </span>
            <h1 className="font-heading text-4xl md:text-6xl leading-[1.02] text-ink">
              Integrated digital platforms for the way you operate.
            </h1>
            <p className="font-body text-xl leading-relaxed text-ink-soft">
              Kalahari Technology Holdings is a technology solutions provider focused on
              streamlining retail, hospitality, and supply chain operations. Four practices, each
              designed to plug into the systems you already run.
            </p>
          </div>
        </section>

        {practices.map((practice, index) => (
          <section
            key={practice.number}
            className={index % 2 === 1 ? 'bg-surface-tint' : undefined}
          >
            <div className="max-w-7xl mx-auto px-6 py-14 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
                  {practice.number} · {practice.eyebrow}
                </span>
                <h2 className="font-heading text-3xl md:text-4xl leading-[1.05] text-ink">
                  {practice.heading}
                </h2>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                {practice.offerings.map((offering) => (
                  <div
                    key={offering.title}
                    className="border border-line rounded-sm p-6 flex flex-col gap-3 bg-surface"
                  >
                    <h3 className="font-heading text-2xl leading-[1.05] text-ink">
                      {offering.title}
                    </h3>
                    <p className="font-body text-lg leading-relaxed text-ink-soft">
                      {offering.copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA slab */}
        <section className="bg-ink">
          <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-start gap-5">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-cream/70">
              Start a conversation
            </span>
            <h2 className="font-heading text-4xl md:text-5xl leading-[1.05] text-cream max-w-3xl">
              Have an operation that needs streamlining?
            </h2>
            <p className="font-body text-xl leading-relaxed text-cream/85 max-w-2xl">
              From a single storefront to an enterprise warehouse, we scope, build, and integrate
              the platform that fits.
            </p>
            <a
              href="/#contact"
              className="bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-4 rounded-sm transition-opacity"
            >
              Talk to us
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
