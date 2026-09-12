import React from 'react';
import { shopsApi } from '../../lib/storage';

export default function UnitsSection({ onBookShop }) {
  // Sort alphabetically so "Costa e Silva" appears before "Mario Quintana"
  const shops = [...shopsApi.getActive()].sort((a, b) => a.name.localeCompare(b.name));

  // Imagery tailored for each unit
  const unitDetails = {
    'shop-1': {
      image: '/img_branch.jpg', // Agora img_branch.jpg na Sede Mario Quintana
      tag: 'Sede Principal',
      flagColor: 'bg-brand-yellow',
      borderColor: 'border-brand-yellow/30',
      hours: 'Seg a Sáb: 09h00 às 20h00',
      phone: '(51) 8165-6799',
    },
    'shop-2': {
      image: '/img_hq.jpg', // Sede Costa e Silva agora tem a img_hq.jpg
      tag: 'Filial Contemporânea',
      flagColor: 'bg-brand-blue',
      borderColor: 'border-brand-blue/30',
      hours: 'Seg a Sáb: 09h00 às 20h00',
      phone: '(51) 8165-6799',
    },
  };

  const isShopOpen = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 0) return false; // Fechado domingo
    if (hour >= 9 && hour < 20) return true;
    return false;
  };

  const isOpen = isShopOpen();

  return (
    <section id="unidades" className="relative py-24 md:py-32 bg-dark-900 border-t border-white/5 overflow-hidden">
      {/* Cinematic Animated Atmosphere */}
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-red/30 bg-brand-red/10 text-brand-red text-xs uppercase tracking-widest font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            Onde Estamos
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
            Nossas <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow">
              Unidades Exclusivas
            </span>
          </h2>
          <p className="text-base md:text-lg text-neutral-400">
            Ambientes climatizados, estacionamento conveniado e localização de fácil acesso.
          </p>
        </div>

        {/* Units Cards Grid — Inspired by Behance layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {shops.map((shop) => {
            const detail = unitDetails[shop.id] || unitDetails['shop-1'];
            return (
              <div
                key={shop.id}
                className={`group relative rounded-[2.5rem] overflow-hidden border ${detail.borderColor} bg-dark-950 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col h-[480px] md:h-[520px]`}
              >
                {/* Background Image */}
                <img
                  src={detail.image}
                  alt={shop.name}
                  className="absolute inset-0 w-full h-full object-cover object-center brightness-75 group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-dark-950/30" />

                {/* Top Badge */}
                <div className="relative z-10 p-6 md:p-8 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-900/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-neutral-200">
                    <span className={`w-2 h-2 rounded-full ${detail.flagColor}`} />
                    {detail.tag}
                  </div>
                  {isOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Aberto Hoje
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      Fechado
                    </span>
                  )}
                </div>

                {/* Bottom Content Card — Exactly replicating Behance styling */}
                <div className="relative z-10 mt-auto p-6 md:p-8">
                  <div className="p-6 rounded-3xl bg-dark-900/85 backdrop-blur-xl border border-white/10 shadow-xl">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                      {shop.name}
                    </h3>

                    <p className="text-sm text-neutral-300 font-medium flex items-center gap-2 mb-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-yellow shrink-0">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {shop.address}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 pt-3 border-t border-white/10 mb-4">
                      <span>🕒 {detail.hours}</span>
                      <span>📞 {detail.phone}</span>
                    </div>

                    <button
                      onClick={() => onBookShop(shop)}
                      className="w-full py-3 px-4 rounded-xl bg-brand-yellow text-dark-950 font-black text-sm uppercase tracking-wider transition-all duration-200 hover:bg-yellow-400 shadow-md flex items-center justify-center gap-2 btn-press"
                    >
                      Agendar nesta unidade
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
