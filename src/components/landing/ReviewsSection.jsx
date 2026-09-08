import React from 'react';

export default function ReviewsSection() {
  const reviews = [
    {
      name: 'Guilherme Sampaio',
      role: 'Cliente Frequente',
      text: 'Melhor experiência de barbearia que já tive em São Paulo. O atendimento do Carlos no fade é impecável e a toalha quente é um diferencial absurdo.',
      rating: 5,
      date: 'Há 3 dias',
    },
    {
      name: 'Leonardo Menezes',
      role: 'Empresário',
      text: 'O sistema de agendamento online é rápido demais! Cheguei na Sede Colômbia no horário e fui atendido na hora, sem espera. Cerveja gelada e barba alinhada na navalha.',
      rating: 5,
      date: 'Há 1 semana',
    },
    {
      name: 'Danilo Alcantara',
      role: 'Arquiteto',
      text: 'O ambiente é sensacional, decoração clássica e iluminação perfeita. O Rafael é um mestre da navalha. Não troco essa barbearia por nada.',
      rating: 5,
      date: 'Há 2 semanas',
    },
  ];

  return (
    <section id="avaliacoes" className="relative py-24 md:py-32 bg-dark-900 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs uppercase tracking-widest font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Depoimentos & Experiências
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
            Confiança & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-200 to-brand-yellow">
              Reconhecimento
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-brand-yellow mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
            <span className="text-white font-black text-lg ml-2">4.9 / 5.0</span>
          </div>
          <p className="text-xs text-neutral-400">Baseado em mais de 1.200 avaliações de clientes</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-8 rounded-3xl bg-dark-950/70 border border-white/10 shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center gap-1 text-brand-yellow mb-4">
                  {[...Array(r.rating)].map((_, idx) => (
                    <svg key={idx} width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-neutral-300 italic leading-relaxed mb-6">
                  "{r.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{r.name}</h4>
                  <span className="text-xs text-neutral-500">{r.role}</span>
                </div>
                <span className="text-[11px] text-neutral-500">{r.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
