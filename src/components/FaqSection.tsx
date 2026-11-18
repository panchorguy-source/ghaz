import {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {FAQ_ITEMS} from '../data/gisContent';
import {Reveal} from './Reveal';

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggleItem = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section
      id="soalan-lazim"
      aria-labelledby="heading-faq"
      className="border-t border-slate-200 bg-slate-50/70 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-left sm:text-center">
            <p className="text-sm font-semibold text-blue-900">Soalan Lazim</p>
            <h2
              id="heading-faq"
              className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl text-balance"
            >
              Jawapan ringkas untuk soalan ibu bapa dan lepasan SPM
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              Ketahui maklumat asas mengenai pengiktirafan program, pembiayaan, penginapan dan proses permohonan di GIS.
            </p>
          </div>
        </Reveal>

        <Reveal delayMs={80}>
          <div className="mt-10 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id;
              const panelId = `${item.id}-panel`;
              const buttonId = `${item.id}-button`;

              return (
                <div key={item.id}>
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleItem(item.id)}
                      className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-semibold text-slate-950 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-800 sm:px-6 sm:py-5"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${
                          isOpen ? 'rotate-180 text-blue-900' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                    className="px-5 pb-5 pt-0 text-[15px] leading-relaxed text-slate-600 sm:px-6 sm:pb-6"
                  >
                    <p>{item.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
