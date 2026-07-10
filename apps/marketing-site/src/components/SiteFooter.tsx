import React from 'react';

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-cream/70 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="font-heading text-2xl text-cream">Kalahari</span>
        <div className="flex flex-wrap justify-center gap-6 font-caption text-xs font-bold uppercase tracking-[0.12em]">
          <a href="/legal" className="hover:text-cream transition-colors">Privacy (POPIA)</a>
          <a href="/legal" className="hover:text-cream transition-colors">Terms</a>
          <a href="/legal" className="hover:text-cream transition-colors">PAIA manual</a>
          <a href="/trust" className="hover:text-cream transition-colors">NCR information</a>
        </div>
        <p className="font-body text-sm text-cream/60">© 2026 Kalahari Technology Holdings. All rights reserved.</p>
      </div>
    </footer>
  );
}
