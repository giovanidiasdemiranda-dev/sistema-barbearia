import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../../lib/storage';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

export default function ReviewManager() {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);

  const load = () => {
    setReviews(reviewsApi.getAll());
  };

  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    window.addEventListener('tlbc_storage_update', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('tlbc_storage_update', load);
    };
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Tem certeza que deseja apagar esta avaliação?')) return;
    reviewsApi.delete(id);
    addToast('Avaliação removida', 'info');
    load();
  };

  const handleClearAll = () => {
    if (!window.confirm('CUIDADO: Tem certeza que deseja apagar TODAS as avaliações?')) return;
    reviewsApi.clearAll();
    addToast('Todas as avaliações foram removidas', 'info');
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-50">Gerenciar Avaliações</h2>
          <p className="text-sm text-neutral-400">Total de {reviews.length} depoimentos registrados.</p>
        </div>
        {reviews.length > 0 && (
          <Button variant="outline" onClick={handleClearAll} className="text-red-400 border-red-500/30 hover:bg-red-500/10">
            Zerar Avaliações
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-dark-800 rounded-2xl border border-dark-600">
          <span className="text-3xl mb-3">⭐</span>
          <p className="text-neutral-500 font-medium">Nenhuma avaliação encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-dark-800 rounded-2xl border border-dark-600 p-5 relative group">
              <button 
                onClick={() => handleDelete(r.id)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Excluir Avaliação"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
              
              <div className="flex items-center gap-1 text-brand-yellow mb-3">
                {[...Array(r.rating)].map((_, i) => (
                  <svg key={i} width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                ))}
              </div>
              
              <p className="text-sm text-neutral-300 italic mb-4 min-h-[40px]">
                "{r.text || 'Sem comentário'}"
              </p>
              
              <div className="pt-3 border-t border-dark-600">
                <p className="text-sm font-bold text-white">{r.name}</p>
                <p className="text-xs text-neutral-500">Avaliou {r.barber_name} em {new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
