import React, { useState, useEffect } from 'react';
import { barbersApi } from '../../lib/storage';

export default function TeamSection({ onBookBarber }) {
  const [barbers, setBarbers] = useState(barbersApi.getAll());

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail.key === 'tlbc_barbers') {
        setBarbers(barbersApi.getAll());
      }
    };
    window.addEventListener('tlbc_storage_update', handleUpdate);
    return () => window.removeEventListener('tlbc_storage_update', handleUpdate);
  }, []);

  return (
    <section id="equipe" className="relative py-24 md:py-32 bg-dark-950 border-t border-white/5 overflow-hidden">
      {/* Cinematic Animated Atmosphere */}
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow text-xs uppercase tracking-widest font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
            Mestres Barbeiros
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
            Conheça os Nossos <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow">
              Artistas da Navalha
            </span>
          </h2>
          <p className="text-base md:text-lg text-neutral-400">
            Cada profissional traz anos de prática, técnicas exclusivas e a assinatura da maestria latina.
          </p>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-dark-900/60 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 shadow-xl"
            >
              {/* Photo with colored Colombia border */}
              <div className="relative mb-6">
                <div
                  className="w-28 h-28 rounded-full p-1 transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: barber.color }}
                >
                  <img
                    src={barber.photo_url}
                    alt={barber.name}
                    className="w-full h-full rounded-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <span
                  className="absolute bottom-0 right-1 w-5 h-5 rounded-full border-2 border-dark-900 shadow-md"
                  style={{ backgroundColor: barber.color }}
                  title="Identidade da cadeira"
                />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-brand-yellow transition-colors">
                {barber.name}
              </h3>

              <p className="text-xs text-neutral-400 leading-relaxed mb-6 flex-1 max-w-xs">
                {barber.bio}
              </p>

              <button
                onClick={() => onBookBarber(barber)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-dark-800 text-neutral-200 border border-white/10 hover:bg-brand-yellow hover:text-dark-950 hover:border-brand-yellow transition-all duration-200 btn-press"
              >
                Agendar com {barber.name.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
