import {ExternalLink, Mail, MapPin, Phone} from 'lucide-react';
import {GIS_CONTACT, NAV_LINKS, WHATSAPP_URL} from '../data/gisContent';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export function Footer({onOpenAdmin}: FooterProps) {
  return (
    <footer
      id="hubungi"
      className="border-t border-slate-200 bg-slate-50 text-slate-700"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="inline-flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-900 text-xs font-bold tracking-tight text-amber-300"
              >
                GIS
              </span>
              <span className="font-display text-lg font-bold text-slate-950">
                {GIS_CONTACT.institutionName}
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              Menyediakan panduan laluan pendidikan TVET, Sijil Kemahiran Malaysia (SKM) dan Diploma di Nilai, Negeri Sembilan dengan penekanan kepada kemahiran praktikal serta persediaan kerjaya.
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-display text-sm font-bold text-slate-950">
              Pautan Pantas
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-slate-600 transition-colors hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#daftar"
                  className="font-medium text-blue-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  Mohon Pendaftaran Online
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  onClick={(e) => {
                    if (onOpenAdmin) {
                      e.preventDefault();
                      onOpenAdmin();
                    }
                  }}
                  className="text-slate-500 transition-colors hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  Portal Staf (CRM)
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="font-display text-sm font-bold text-slate-950">
              Maklumat Perhubungan
            </h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-900" aria-hidden="true" />
                <span>
                  {GIS_CONTACT.location} (alamat rasmi tertakluk kepada pengesahan GIS)
                </span>
              </li>
              <li className="flex items-center gap-2.5 tabular-nums">
                <Phone className="h-4 w-4 shrink-0 text-blue-900" aria-hidden="true" />
                <a
                  href={GIS_CONTACT.phoneHref}
                  className="hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  {GIS_CONTACT.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-900" aria-hidden="true" />
                <a
                  href={`mailto:${GIS_CONTACT.email}`}
                  className="hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  {GIS_CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <ExternalLink className="h-4 w-4 shrink-0 text-blue-900" aria-hidden="true" />
                <a
                  href={GIS_CONTACT.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  www.gis.edu.my/bm/
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 tabular-nums"
                >
                  WhatsApp Penasihat: {GIS_CONTACT.whatsappDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 space-y-2 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
          <p>
            Notis Ilustrasi Prototaip: Gambar pelajar dan suasana latihan yang dipaparkan pada laman prototaip ini adalah ilustrasi janaan AI bagi tujuan pratonton reka bentuk dan bukan foto sebenar pelajar atau kemudahan GIS sehingga digantikan dengan fotografi rasmi pihak institusi.
          </p>
          <p>
            Notis Privasi: Maklumat peribadi yang dikemukakan hanya digunakan bagi urusan khidmat nasihat pengajian selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA).
          </p>
          <p className="pt-1 text-slate-600">
            &copy; {new Date().getFullYear()} {GIS_CONTACT.institutionName}. Hak cipta terpelihara.
          </p>
        </div>
      </div>
    </footer>
  );
}
