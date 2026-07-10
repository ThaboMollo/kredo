import React from 'react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const sections = [
  {
    title: '1. Privacy policy & POPIA statement',
    paragraphs: [
      'In compliance with the South African Protection of Personal Information Act (POPIA), we are committed to protecting your privacy. We collect personal identifiers — full name, email, phone number, and South African identity number — solely for credit evaluation and identity verification purposes.',
      'All stored PII is encrypted at rest using AES-256-GCM. We maintain an append-only, auditable record of all consent decisions (granting and withdrawal). You may request a complete export of your personal data or delete your account at any time from profile settings.',
    ],
  },
  {
    title: '2. Terms of service',
    paragraphs: [
      'By registering for a Kalahari subscription or utilising our Kredo credit facility, you agree to comply with our Terms of Service. Users are responsible for providing accurate academic enrollment and banking details.',
      'Credit facility limits are dynamic and calculated using National Credit Act (NCA) affordability checks. On-time repayments are reported to major credit bureaus. Defaults or late payments will be reported as delinquent accounts, which could negatively impact your credit standing.',
    ],
  },
  {
    title: '3. PAIA manual disclosures',
    paragraphs: [
      'In accordance with the Promotion of Access to Information Act (PAIA), Kalahari maintains record logs relating to corporate compliance, operating licences, and consumer registers. Request procedures for records are handled by our designated Information Officer.',
    ],
  },
];

export default function Legal() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />

      <main className="max-w-3xl mx-auto w-full px-6 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <span className="font-caption text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Legal
          </span>
          <h1 className="font-heading text-4xl md:text-5xl leading-[1.02] text-ink">
            Legal agreements &amp; policies.
          </h1>
          <p className="font-caption text-xs text-ink-soft">Last updated: July 9, 2026</p>
        </div>

        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-4">
            <h2 className="font-heading text-3xl text-ink border-b border-line pb-3">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="font-body text-lg leading-relaxed text-ink-soft">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
