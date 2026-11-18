import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import {GIS_CONTACT, WHATSAPP_URL} from '../data/gisContent';
import {Reveal} from './Reveal';

interface EnquirySectionProps {
  selectedProgramme: string;
  onClearProgramme: () => void;
  nameInputRef: RefObject<HTMLInputElement | null>;
}

interface FormValues {
  name: string;
  phone: string;
  email: string;
  website: string; // Anti-bot honeypot (never visible)
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

interface SubmissionResult {
  ok: boolean;
  referenceId?: string;
  syncedToSheets?: boolean;
  sheetsConfigured?: boolean;
  message: string;
}

function validatePhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  return /^(?:\+?60|0)(?:1\d{8,9}|[2-9]\d{7,8})$/.test(cleaned);
}

function validateEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

export function EnquirySection({
  selectedProgramme,
  onClearProgramme,
  nameInputRef,
}: EnquirySectionProps) {
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: '',
    email: '',
    website: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const handleChange =
    (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setValues((prev) => ({...prev, [field]: nextValue}));
      if (field === 'name' || field === 'phone' || field === 'email') {
        setErrors((prev) => ({...prev, [field]: undefined}));
      }
      if (result) {
        setResult(null);
      }
    };

  const validateAll = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (values.name.trim().length < 2) {
      nextErrors.name = 'Sila masukkan nama penuh anda (sekurang-kurangnya 2 aksara).';
    }
    if (!validatePhone(values.phone)) {
      nextErrors.phone =
        'Sila masukkan nombor telefon Malaysia yang sah (contoh: 012-3456789).';
    }
    if (!validateEmail(values.email)) {
      nextErrors.email =
        'Sila masukkan alamat e-mel yang sah (contoh: nama@emel.com).';
    }
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          website: values.website,
          programmeInterest: selectedProgramme || 'Pertanyaan Umum',
          source: 'Laman Web GIS Nilai',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        if (data?.field && (data.field === 'name' || data.field === 'phone' || data.field === 'email')) {
          setErrors({[data.field]: data.error});
        }
        setResult({
          ok: false,
          message:
            data?.error ||
            'Pertanyaan tidak dapat dihantar buat masa ini. Sila hubungi penasihat kami terus melalui WhatsApp.',
        });
        return;
      }

      const syncedToSheets = Boolean(data.syncedToSheets);
      const sheetsConfigured = Boolean(data.sheetsConfigured);

      setResult({
        ok: true,
        referenceId: data.referenceId,
        syncedToSheets,
        sheetsConfigured,
        message: syncedToSheets
          ? 'Terima kasih. Pertanyaan anda telah berjaya direkodkan untuk semakan penasihat GIS.'
          : 'Terima kasih. Maklumat pertanyaan anda telah direkodkan pada pelayan laman ini. Sambungan Google Sheets belum diaktifkan — sila klik WhatsApp di bawah untuk maklum balas segera.',
      });

      setValues({name: '', phone: '', email: '', website: ''});
      setErrors({});
    } catch {
      setResult({
        ok: false,
        message:
          'Ralat rangkaian berlaku semasa menghantar borang. Sila cuba lagi atau hubungi penasihat GIS melalui WhatsApp.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="daftar"
      aria-labelledby="heading-enquiry"
      className="border-t border-slate-200 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Left column: Clear context and direct WhatsApp option */}
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-sm font-semibold text-blue-900">
                Pertanyaan &amp; Pendaftaran Minat
              </p>
              <h2
                id="heading-enquiry"
                className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl text-balance"
              >
                Dapatkan maklumat lanjut atau bincang dengan penasihat kami
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Tinggalkan nama, nombor telefon dan e-mel anda. Penasihat pengajian GIS akan menghubungi anda untuk berkongsi maklumat program, semakan kelayakan serta pilihan pembiayaan.
              </p>

              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="font-display text-base font-bold text-slate-950">
                  Ingin jawapan lebih cepat?
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Anda juga boleh terus menghantar mesej WhatsApp kepada penasihat pengajian GIS atau menghubungi talian pejabat kami.
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>WhatsApp Penasihat GIS ({GIS_CONTACT.whatsappDisplay})</span>
                  </a>

                  <a
                    href={GIS_CONTACT.phoneHref}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 tabular-nums"
                  >
                    <Phone className="h-4 w-4 text-blue-900" aria-hidden="true" />
                    <span>Hubungi Pejabat: {GIS_CONTACT.phoneDisplay}</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right column: Strictly 3 visible inputs */}
          <div className="lg:col-span-7">
            <Reveal delayMs={80}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="border-b border-slate-100 pb-5">
                  <h3 className="font-display text-xl font-bold text-slate-950">
                    Borang Pertanyaan Maklumat Program
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Borang ini adalah untuk <strong>pertanyaan dan pendaftaran minat sahaja</strong>, bukan tawaran kemasukan automatik.
                  </p>

                  {selectedProgramme && (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/80 px-3.5 py-2.5 text-sm text-blue-950">
                      <span>
                        Program dipilih:{' '}
                        <strong className="font-semibold">{selectedProgramme}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={onClearProgramme}
                        aria-label="Kosongkan pilihan program"
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-blue-900 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                  {/* Anti-bot honeypot field (hidden from assistive tech & visual users) */}
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="enquiry-website">Laman web</label>
                    <input
                      id="enquiry-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.website}
                      onChange={handleChange('website')}
                    />
                  </div>

                  {/* Visible Field 1: Nama penuh */}
                  <div>
                    <label
                      htmlFor="enquiry-name"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Nama penuh <span className="text-red-700">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      id="enquiry-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Contoh: Ahmad bin Abdullah"
                      value={values.name}
                      onChange={handleChange('name')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'enquiry-name-error' : undefined}
                      className={`mt-1.5 block min-h-12 w-full rounded-lg border bg-white px-4 py-2.5 text-base text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        errors.name
                          ? 'border-red-600 focus:border-red-600 focus:ring-red-200'
                          : 'border-slate-300 focus:border-blue-800 focus:ring-blue-100'
                      }`}
                    />
                    {errors.name && (
                      <p
                        id="enquiry-name-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-700"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Visible Field 2: Nombor telefon */}
                  <div>
                    <label
                      htmlFor="enquiry-phone"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Nombor telefon <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="enquiry-phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="Contoh: 012-3456789"
                      value={values.phone}
                      onChange={handleChange('phone')}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'enquiry-phone-error' : 'enquiry-phone-hint'}
                      className={`mt-1.5 block min-h-12 w-full rounded-lg border bg-white px-4 py-2.5 text-base text-slate-950 placeholder:text-slate-400 tabular-nums focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-red-600 focus:border-red-600 focus:ring-red-200'
                          : 'border-slate-300 focus:border-blue-800 focus:ring-blue-100'
                      }`}
                    />
                    <p id="enquiry-phone-hint" className="mt-1 text-xs text-slate-500">
                      Format Malaysia (contoh: 012-3456789 atau +60123456789).
                    </p>
                    {errors.phone && (
                      <p
                        id="enquiry-phone-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-700"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Visible Field 3: Alamat e-mel */}
                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Alamat e-mel <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="enquiry-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Contoh: ibu.bapa@emel.com"
                      value={values.email}
                      onChange={handleChange('email')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'enquiry-email-error' : undefined}
                      className={`mt-1.5 block min-h-12 w-full rounded-lg border bg-white px-4 py-2.5 text-base text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-600 focus:border-red-600 focus:ring-red-200'
                          : 'border-slate-300 focus:border-blue-800 focus:ring-blue-100'
                      }`}
                    />
                    {errors.email && (
                      <p
                        id="enquiry-email-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-700"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-slate-500">
                    Notis Privasi (PDPA): Dengan menghantar borang ini, anda bersetuju membenarkan pihak {GIS_CONTACT.institutionName} menghubungi anda bagi tujuan pertanyaan program pengajian, maklumat pembiayaan dan panduan pendaftaran selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA).
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-base font-bold text-slate-950 shadow-xs transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        <span>Sedang menghantar...</span>
                      </>
                    ) : (
                      <span>Hantar Pertanyaan</span>
                    )}
                  </button>

                  {/* Accessible live status announcement */}
                  <div aria-live="polite" role="status">
                    {result && (
                      <div
                        className={`rounded-xl border p-4 text-sm leading-relaxed ${
                          result.ok
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                            : 'border-red-200 bg-red-50 text-red-950'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {result.ok ? (
                            <CheckCircle2
                              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                              aria-hidden="true"
                            />
                          ) : (
                            <AlertCircle
                              className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                              aria-hidden="true"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{result.message}</p>
                            {result.referenceId && (
                              <p className="mt-1 text-xs text-emerald-800 tabular-nums">
                                Rujukan pertanyaan: {result.referenceId}
                              </p>
                            )}
                            {(!result.ok || !result.syncedToSheets) && (
                              <div className="mt-3">
                                <a
                                  href={WHATSAPP_URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                                >
                                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                  <span>Teruskan ke WhatsApp Penasihat GIS</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
