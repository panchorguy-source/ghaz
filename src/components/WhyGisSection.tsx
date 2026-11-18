import {Check, ShieldCheck} from 'lucide-react';
import {REASSURANCE_PILLARS} from '../data/gisContent';
import {Reveal} from './Reveal';

export function WhyGisSection() {
  return (
    <section
      id="kelebihan"
      aria-labelledby="heading-why-gis"
      className="bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-sm font-semibold text-blue-900">
                Kenapa Pilih GIS?
              </p>
              <h2
                id="heading-why-gis"
                className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl text-balance"
              >
                Pendekatan telus dan berpandu untuk ketenangan hati ibu bapa
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Memilih tempat pengajian selepas SPM memerlukan maklumat yang tepat. Di Global Institute of Studies (GIS), penasihat pengajian kami memberi penerangan secara berterus terang mengenai laluan kemahiran, keperluan pembiayaan serta sokongan pelajar.
              </p>

              {/* Clean institutional summary card — no thick left border, no fake stats */}
              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-900"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-950">
                      Komitmen maklumat yang jujur
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      Kami tidak menjanjikan kelulusan pinjaman automatik atau jaminan pekerjaan tetap. Sebaliknya, setiap pelajar dinilai kelayakannya secara teliti dan dibimbing ke arah kemahiran yang sesuai dengan minat mereka.
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-5 text-sm">
                  <div>
                    <dt className="text-slate-500">Laluan Kemahiran</dt>
                    <dd className="mt-1 font-semibold text-slate-900">
                      TVET / SKM (JPK)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Laluan Akademik</dt>
                    <dd className="mt-1 font-semibold text-slate-900">
                      Diploma (MQA)
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delayMs={100}>
              <ol className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {REASSURANCE_PILLARS.map((pillar) => (
                  <li key={pillar.index} className="flex gap-4 p-5 sm:gap-5 sm:p-6">
                    <div className="flex shrink-0 flex-col items-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-900">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-xs font-semibold text-slate-400 tabular-nums">
                          {pillar.index}.
                        </span>
                        <h3 className="font-display text-base font-bold text-slate-950 sm:text-lg">
                          {pillar.title}
                        </h3>
                      </div>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">
                        {pillar.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
