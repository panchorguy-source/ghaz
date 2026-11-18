import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Compass,
  Wallet,
} from 'lucide-react';
import {PARENT_CONCERNS, type ParentConcernItem} from '../data/gisContent';
import {Reveal} from './Reveal';

function ConcernIcon({iconKey}: {iconKey: ParentConcernItem['iconKey']}) {
  const iconClass = 'h-5 w-5 text-blue-900';
  switch (iconKey) {
    case 'funding':
      return <Wallet className={iconClass} aria-hidden="true" />;
    case 'career':
      return <Briefcase className={iconClass} aria-hidden="true" />;
    case 'recognition':
      return <Award className={iconClass} aria-hidden="true" />;
    case 'hostel':
      return <Building2 className={iconClass} aria-hidden="true" />;
    case 'relevance':
      return <Compass className={iconClass} aria-hidden="true" />;
  }
}

export function ParentConcernsSection() {
  return (
    <section
      aria-labelledby="heading-parent-concerns"
      className="bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-900">
              Panduan Untuk Ibu Bapa &amp; Penjaga
            </p>
            <h2
              id="heading-parent-concerns"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl text-balance"
            >
              Lima perkara utama yang ibu bapa ingin tahu sebelum memilih kolej
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Kami memahami keputusan selepas SPM melibatkan masa depan anak dan komitmen keluarga. Berikut maklumat asas yang telus untuk rujukan anda.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {PARENT_CONCERNS.map((item, idx) => {
            // Asymmetric 2+3 grid rhythm on desktop
            const spanClass = idx < 2 ? 'lg:col-span-3' : 'lg:col-span-2';
            return (
              <Reveal key={item.id} delayMs={idx * 60} className={spanClass}>
                <article className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-6 transition-colors hover:border-blue-300 hover:bg-white">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                        <ConcernIcon iconKey={item.iconKey} />
                      </span>
                      <span className="text-xs font-semibold tracking-wider text-slate-400 tabular-nums">
                        {item.index}.
                      </span>
                    </div>

                    <h3 className="mt-5 font-display text-lg font-bold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-2">
                    <a
                      href={item.href}
                      className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-blue-900 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
