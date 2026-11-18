import {useState} from 'react';
import {ArrowRight, GraduationCap, MessageCircle} from 'lucide-react';
import {HERO_CONTENT, HERO_IMAGE, WHATSAPP_URL} from '../data/gisContent';

export function HeroSection() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section
      id="utama"
      className="relative overflow-hidden border-b border-slate-200 bg-slate-50"
    >
      {/* Full-bleed background visual with light-mode left contrast scrim */}
      <div className="absolute inset-0">
        {!imageFailed ? (
          <img
            src={HERO_IMAGE}
            alt="Sekumpulan pelajar muda Malaysia di ruang legar kampus moden Global Institute of Studies"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="hero-ken-burns h-full w-full object-cover object-[72%_center] sm:object-right"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-end bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pr-12">
            <GraduationCap className="h-40 w-40 text-blue-900/15" aria-hidden="true" />
          </div>
        )}

        {/* Measured light gradient scrim keeping right-side students clear while ensuring >=4.5:1 left contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/75 md:from-white md:via-white/92 md:to-white/10 lg:via-white/88 lg:to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-white/85 via-transparent to-white/40 md:hidden"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Quiet unboxed eyebrow metadata */}
          <p className="text-sm font-semibold tracking-wide text-blue-900">
            {HERO_CONTENT.eyebrow}
          </p>

          <h1 className="mt-4 font-display text-[clamp(2.25rem,4vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-slate-950 text-balance">
            {HERO_CONTENT.headline}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
            {HERO_CONTENT.supportCopy}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a
              href="#daftar"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
            >
              <span>{HERO_CONTENT.primaryCta}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white/95 px-5 py-3 text-base font-semibold text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
            >
              <MessageCircle className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              <span>{HERO_CONTENT.secondaryCta}</span>
            </a>
          </div>

          {/* Concise unboxed credibility statements */}
          <ul
            aria-label="Ringkasan laluan pengajian GIS"
            className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200/90 pt-5 text-sm font-medium text-slate-700"
          >
            {HERO_CONTENT.credibilityPoints.map((point, idx) => (
              <li key={point} className="inline-flex items-center gap-5">
                <span>{point}</span>
                {idx < HERO_CONTENT.credibilityPoints.length - 1 && (
                  <span aria-hidden="true" className="hidden text-slate-300 sm:inline">
                    /
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
