import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../../lib/storage';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = () => {
      const allReviews = reviewsApi.getAll();
      setReviews(allReviews.slice(0, 6)); // Display up to 6 most recent
    };
    load();
    window.addEventListener('storage', load);
    window.addEventListener('tlbc_storage_update', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('tlbc_storage_update', load);
    };
  }, []);

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(d);
  };

  // Calculate average rating dynamically
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="avaliacoes" className="relative py-24 md:py-32 bg-dark-900 border-t border-white/5 overflow-hidden">
      {/* Cinematic Animated Atmosphere */}
      
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
            <span className="text-white font-black text-lg ml-2">{avgRating} / 5.0</span>
          </div>
          <p className="text-xs text-neutral-400">
            {reviews.length > 0 ? `Baseado nas avaliações recentes dos nossos clientes` : 'Sua experiência é nossa prioridade'}
          </p>
        </div>

        {/* Reviews Grid / Empty State */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 px-6 bg-dark-800/50 rounded-3xl border border-white/5">
            <div className="w-16 h-16 mx-auto bg-dark-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Seja o primeiro a avaliar!</h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Nossa equipe está trabalhando duro. Os clientes poderão deixar suas avaliações no momento da conclusão do corte.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div
                key={r.id || i}
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
                    "{r.text || 'Excelente atendimento e ótimo ambiente. Recomendo!'}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.name}</h4>
                    <span className="text-xs text-neutral-500">{r.role} • c/ {r.barber_name}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500">{formatDateLabel(r.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
