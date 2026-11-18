import {useRef, useState, type KeyboardEvent} from 'react';
import {ArrowRight, BookOpen} from 'lucide-react';
import {
  PROGRAMMES,
  type ProgrammeCategory,
  type ProgrammeItem,
} from '../data/gisContent';
import {Reveal} from './Reveal';

interface ProgrammesSectionProps {
  onSelectProgramme: (programmeTitle: string) => void;
}

const TABS: {id: ProgrammeCategory; label: string; subtitle: string}[] = [
  {
    id: 'tvet',
    label: 'TVET / Sijil Kemahiran (SKM)',
    subtitle: 'Latihan kemahiran teknikal dan amali berfokuskan kecekapan kerja.',
  },
  {
    id: 'diploma',
    label: 'Program Diploma',
    subtitle: 'Gabungan teori pengurusan, amali bidang serta laluan kerjaya atau pengajian lanjutan.',
  },
];

function ProgrammeCard({
  item,
  onInterest,
}: {
  item: ProgrammeItem;
  onInterest: (title: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.imageAlt}
            loading="lazy"
            width={640}
            height={480}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-blue-50 p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-900/50" aria-hidden="true" />
            <span className="text-sm font-medium text-slate-600">{item.title}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="text-blue-900">{item.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{item.accreditationTrack}</span>
          </div>

          <h3 className="mt-2 font-display text-lg font-bold text-slate-950">
            {item.title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {item.summary}
          </p>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onInterest(`${item.categoryLabel} — ${item.title}`)}
            className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-sm font-semibold text-blue-950 transition-colors hover:border-blue-900 hover:bg-blue-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            <span className="whitespace-nowrap">Saya Berminat</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProgrammesSection({onSelectProgramme}: ProgrammesSectionProps) {
  const [activeTab, setActiveTab] = useState<ProgrammeCategory>('tvet');
  const tabRefs = useRef<Record<ProgrammeCategory, HTMLButtonElement | null>>({
    tvet: null,
    diploma: null,
  });

  const activeItems = PROGRAMMES.filter((item) => item.category === activeTab);
  const currentTabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % TABS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = TABS.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetTab = TABS[nextIndex].id;
      setActiveTab(targetTab);
      tabRefs.current[targetTab]?.focus();
    }
  };

  return (
    <section
      id="program"
      aria-labelledby="heading-programmes"
      className="border-y border-slate-200 bg-slate-50/70 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-900">
                Penerokaan Laluan Pengajian
              </p>
              <h2
                id="heading-programmes"
                className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl text-balance"
              >
                Pilih laluan TVET / SKM atau Diploma yang sesuai
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Senarai di bawah merupakan draf rujukan program untuk pertanyaan awal. Pengesahan status pengambilan semasa dan akreditasi tepat akan dimaklumkan oleh penasihat akademik GIS.
              </p>
            </div>

            {/* Accessible Tablist */}
            <div
              role="tablist"
              aria-label="Kategori Program GIS"
              className="inline-flex w-full shrink-0 rounded-xl border border-slate-200 bg-white p-1.5 sm:w-auto"
            >
              {TABS.map((tab, idx) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[tab.id] = el;
                    }}
                    id={`tab-${tab.id}`}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    className={`min-h-11 flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:flex-initial ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="mt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
        >
          <p className="mb-6 text-sm text-slate-600">{currentTabMeta.subtitle}</p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeItems.map((item) => (
              <ProgrammeCard
                key={item.id}
                item={item}
                onInterest={onSelectProgramme}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
