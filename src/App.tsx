import {useEffect, useRef, useState} from 'react';
import {AdminDashboard} from './components/AdminDashboard';
import {EnquirySection} from './components/EnquirySection';
import {FaqSection} from './components/FaqSection';
import {FloatingWhatsApp} from './components/FloatingWhatsApp';
import {Footer} from './components/Footer';
import {HeroSection} from './components/HeroSection';
import {Navbar} from './components/Navbar';
import {ParentConcernsSection} from './components/ParentConcernsSection';
import {ProgrammesSection} from './components/ProgrammesSection';
import {WhyGisSection} from './components/WhyGisSection';

function isAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  const normalized = window.location.pathname.replace(/\/+$/, '') || '/';
  return normalized === '/admin';
}

export default function App() {
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [onAdminRoute, setOnAdminRoute] = useState<boolean>(() => isAdminPath());
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onPopState = () => {
      setOnAdminRoute(isAdminPath());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (targetPath: '/' | '/admin') => {
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setOnAdminRoute(targetPath === '/admin');
    window.scrollTo({top: 0, behavior: 'auto'});
  };

  if (onAdminRoute) {
    return <AdminDashboard onNavigateHome={() => navigateTo('/')} />;
  }

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

      <Footer onOpenAdmin={() => navigateTo('/admin')} />
      <FloatingWhatsApp />
    </div>
  );
}
