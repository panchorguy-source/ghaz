import {MessageCircle} from 'lucide-react';
import {WHATSAPP_URL} from '../data/gisContent';

export function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Penasihat GIS (012-6618932)"
      className="fixed bottom-4 right-4 z-30 inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-emerald-800/20 bg-emerald-700 px-4 text-sm font-semibold text-white shadow-lg transition-transform duration-150 hover:scale-[1.02] hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 motion-reduce:transform-none sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>WhatsApp GIS</span>
    </a>
  );
}
