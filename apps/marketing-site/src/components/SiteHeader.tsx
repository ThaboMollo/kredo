import React from 'react';
import PortalCTA from '@/components/PortalCTA';

const navLinks = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/trust', label: 'Trust & compliance' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-heading text-2xl text-ink">
          Kalahari
        </a>
        <nav className="hidden md:flex items-center gap-8 font-caption text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink transition-colors">
              {link.label}
            </a>
          ))}
        </nav>
        <PortalCTA className="bg-accent hover:opacity-90 text-cream font-caption text-sm font-semibold px-5 py-3 rounded-sm transition-opacity">
          Apply in Kredo
        </PortalCTA>
      </div>
    </header>
  );
}
