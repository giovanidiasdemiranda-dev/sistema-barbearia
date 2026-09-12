import React, { useState, useEffect } from 'react';
import { servicesApi, formatCurrency } from '../../lib/storage';

export default function ServicesSection({ onBookService }) {
  const [services, setServices] = useState(servicesApi.getActive());

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail.key === 'tlbc_services') {
        setServices(servicesApi.getActive());
      }
    };
    window.addEventListener('tlbc_storage_update', handleUpdate);
    return () => window.removeEventListener('tlbc_storage_update', handleUpdate);
  }, []);

  return (
    <section id="servicos" className="relative py-24 md:py-32 bg-dark-950 border-t border-white/5 overflow-hidden">
      {/* Cinematic Animated Atmosphere */}
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs uppercase tracking-widest font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Menu de Serviços
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
            Cuidados de Alta Precisão & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow">
              Tabela de Valores
            </span>
          </h2>
          <p className="text-base md:text-lg text-neutral-400">
            Escolha o serviço desejado e agende diretamente o seu horário sem complicações.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => {
            const isFeatured = svc.id === 'svc-1' || svc.id === 'svc-16';
            return (
              <div
                key={svc.id}
                className={`relative flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-dark-900/70 border transition-all duration-300 hover:-translate-y-1 ${
                  isFeatured
                    ? 'border-brand-yellow/50 shadow-[0_0_30px_rgba(252,209,22,0.12)]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-brand-yellow text-dark-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    {svc.id === 'svc-1' ? 'Mais Popular' : 'Experiência VIP'}
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {svc.name}
                    </h3>
                    <span className="shrink-0 text-2xl font-black text-brand-yellow">
                      {formatCurrency(svc.price)}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {svc.duration_minutes} min
                  </span>

                  <button
                    onClick={() => onBookService(svc)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-dark-800 text-neutral-200 border border-white/10 hover:bg-brand-yellow hover:text-dark-950 hover:border-brand-yellow transition-all duration-200 btn-press"
                  >
                    Agendar
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
