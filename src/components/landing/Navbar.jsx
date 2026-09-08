import React, { useState, useEffect } from 'react';

export default function Navbar({ onOpenBooking }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Unidades', href: '#unidades' },
    { label: 'Equipe', href: '#equipe' },
    { label: 'Avaliações', href: '#avaliacoes' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-dark-950/85 backdrop-blur-md border-b border-white/10 shadow-2xl py-3.5'
          : 'bg-gradient-to-b from-dark-950/90 via-dark-950/50 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-3">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group shrink-0">
          <img
            src="/logo.png"
            alt="The Latin Barber's Club"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(252,209,22,0.3)] transition-transform duration-300 group-hover:scale-105"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-neutral-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative py-1 hover:text-white transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-yellow hover:after:w-full after:transition-all after:duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={onOpenBooking}
            className="relative inline-flex items-center justify-center px-3.5 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-2.5 bg-brand-yellow text-dark-950 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-105 hover:bg-yellow-400 shadow-[0_0_20px_rgba(252,209,22,0.3)] btn-press whitespace-nowrap"
          >
            <span className="hidden sm:inline">Agendar horário</span>
            <span className="sm:hidden">Agendar</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            className="lg:hidden p-2 rounded-xl bg-dark-900/80 border border-white/10 text-neutral-300 hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 12h16M4 6h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-dark-950/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 animate-slide-up">
          <nav className="flex flex-col gap-4 text-base font-medium text-neutral-200">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-white/5 hover:text-brand-yellow transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
