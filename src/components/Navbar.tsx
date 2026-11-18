import {useEffect, useState} from 'react';
import {Menu, X} from 'lucide-react';
import {GIS_CONTACT, NAV_LINKS} from '../data/gisContent';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line brand lockup */}
        <a
          href="#utama"
          className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md py-1 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-900 text-xs font-bold tracking-tight text-amber-300"
          >
            GIS
          </span>
          <span className="font-display text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {GIS_CONTACT.shortName}
          </span>
        </a>

        {/* Zone 2: Desktop single-line navigation links */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="shrink-0 whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-medium text-slate-700 transition-colors hover:border-blue-800 hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action + Mobile trigger */}
        <div className="flex shrink-0 items-center gap-3">
          <a
            href="#daftar"
            className="hidden shrink-0 whitespace-nowrap rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-xs transition-colors hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:inline-flex"
          >
            Mohon Sekarang
          </a>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Navigasi mudah alih"
          className="border-t border-slate-200 bg-white px-4 py-4 shadow-md lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-lg px-3 py-2 text-base font-medium text-slate-800 transition-colors hover:bg-slate-50 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 border-t border-slate-100 pt-3">
              <a
                href="#daftar"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 w-full items-center justify-center rounded-lg bg-amber-400 px-4 py-2.5 text-base font-semibold text-slate-950 transition-colors hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              >
                Mohon Pendaftaran Online
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
