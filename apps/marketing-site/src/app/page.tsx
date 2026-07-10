import React from 'react';
import Image from 'next/image';
import PortalCTA from '@/components/PortalCTA';
import WaitlistForm from '@/components/WaitlistForm';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const capabilityLabels = [
  'POS & payment systems',
  'Supply chain integration',
  'Contactless hospitality',
  'Custom platforms',
];

const servicePillars = [
  {
    number: '01',
    title: 'POS & payments',
    copy: 'Custom point-of-sale environments and cashless digital account systems, backed by enterprise-grade hardware.',
  },
  {
    number: '02',
    title: 'Inventory & supply chain',
    copy: 'Buyer and inventory portals that integrate directly with Enterprise Warehouse Management systems.',
  },
  {
    number: '03',
    title: 'Contactless hospitality',
    copy: 'NFC and QR digital menus for restaurants, and tech-enabled business cards for professionals.',
  },
  {
    number: '04',
    title: 'Custom platforms',
    copy: 'Tailored web platforms for specific operational needs — from ticketing to student credit.',
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
          alt="Modern retail workspace with integrated technology"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 flex flex-col gap-6">
          <span className="font-caption text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-cream/80">
            Retail · Hospitality · Supply chain
          </span>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-cream max-w-4xl">
            Technology that streamlines how you trade.
          </h1>
          <p className="font-body text-xl md:text-2xl leading-snug text-cream/90 max-w-xl">
            Kalahari Technology Holdings builds integrated digital platforms — from cashless POS
            environments and EWM-connected inventory portals to contactless hospitality tools and
            custom software.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href="/solutions"
              className="bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-4 rounded-sm text-center transition-opacity"
            >
              Explore solutions
            </a>
            <a
              href="#contact"
              className="bg-cream/95 hover:bg-cream text-ink font-caption text-sm font-semibold px-6 py-4 rounded-sm text-center transition-colors"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* Capability label row */}
      <section className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
          {capabilityLabels.map((label) => (
            <span
              key={label}
              className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-ink-soft"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Service pillars */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-24 flex flex-col gap-12">
        <div className="max-w-2xl flex flex-col gap-5">
          <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
            What we do
          </span>
          <h2 className="font-heading text-4xl md:text-5xl leading-[1.02] text-ink">
            Four practices, one integrated approach.
          </h2>
          <p className="font-body text-xl leading-relaxed text-ink-soft">
            Whether it is a school tuckshop going cashless, a warehouse adopting RFID, or a
            restaurant replacing printed menus, every solution connects into the systems you
            already run.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {servicePillars.map((pillar) => (
            <a
              key={pillar.number}
              href="/solutions"
              className="border border-line rounded-sm p-5 flex flex-col gap-2.5 hover:border-accent transition-colors"
            >
              <span className="font-caption text-xs font-bold text-accent">{pillar.number}</span>
              <h3 className="font-heading text-3xl leading-[1.05] text-ink">{pillar.title}</h3>
              <p className="font-body text-lg leading-snug text-ink-soft">{pillar.copy}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Featured platform: Kredo */}
      <section className="max-w-7xl mx-auto px-6 pb-20 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 relative aspect-[13/9] w-full">
          <Image
            src="https://images.unsplash.com/photo-1574420773965-b34c687f35b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Student using the Kredo credit platform"
            fill
            className="object-cover"
          />
        </div>
        <div className="lg:col-span-7 flex flex-col gap-5">
          <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Featured platform · Kredo
          </span>
          <h2 className="font-heading text-4xl md:text-5xl leading-[1.02] text-ink">
            Student credit without the loan-shark feel.
          </h2>
          <p className="font-body text-xl leading-relaxed text-ink-soft">
            Kredo is our regulated fintech platform: students subscribe, qualify responsibly, draw
            down closed-loop vouchers at partner retailers, repay on time, and build a formal
            credit history the right way — with POPIA consent and bureau reporting built in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <PortalCTA className="bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-6 py-4 rounded-sm text-center transition-opacity">
              Start in Kredo
            </PortalCTA>
            <a
              href="/how-it-works"
              className="border border-line hover:border-accent text-ink font-caption text-sm font-semibold px-6 py-4 rounded-sm text-center transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Contact / lead capture slab */}
      <section id="contact" className="bg-ink">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-cream/70">
              Work with us
            </span>
            <h2 className="font-heading text-4xl md:text-5xl leading-[1.05] text-cream">
              Tell us about your operation.
            </h2>
            <p className="font-body text-xl leading-relaxed text-cream/85">
              Running a retail environment, a restaurant, a warehouse, or a campus? Leave your
              details and we will map the right platform — POS, inventory integration, contactless
              tools, or something custom-built.
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
