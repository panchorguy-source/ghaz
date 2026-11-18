import {useRef, useState} from 'react';
import {EnquirySection} from './components/EnquirySection';
import {FaqSection} from './components/FaqSection';
import {FloatingWhatsApp} from './components/FloatingWhatsApp';
import {Footer} from './components/Footer';
import {HeroSection} from './components/HeroSection';
import {Navbar} from './components/Navbar';
import {ParentConcernsSection} from './components/ParentConcernsSection';
import {ProgrammesSection} from './components/ProgrammesSection';
import {WhyGisSection} from './components/WhyGisSection';

export default function App() {
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectProgramme = (programmeTitle: string) => {
    setSelectedProgramme(programmeTitle);
    const target = document.getElementById('daftar');
    if (target) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
    }
    window.setTimeout(() => {
      nameInputRef.current?.focus({preventScroll: true});
    }, 350);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <a
        href="#kandungan-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Langkau ke kandungan utama
      </a>

      <Navbar />

      <main id="kandungan-utama">
        <HeroSection />
        <ParentConcernsSection />
        <ProgrammesSection onSelectProgramme={handleSelectProgramme} />
        <WhyGisSection />
        <FaqSection />
        <EnquirySection
          selectedProgramme={selectedProgramme}
          onClearProgramme={() => setSelectedProgramme('')}
          nameInputRef={nameInputRef}
        />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
