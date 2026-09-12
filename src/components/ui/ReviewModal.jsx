import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ReviewModal({ isOpen, onClose, onSubmit, clientName, barberName }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, text });
    setRating(5);
    setText('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Avaliar Atendimento">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Corte Finalizado!</h3>
        <p className="text-sm text-neutral-400 bg-dark-800 p-4 rounded-xl border border-brand-yellow/20">
          Barbeiro: por favor, vire a tela para o cliente <strong className="text-brand-yellow">{clientName}</strong> avaliar o serviço com {barberName}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stars */}
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-bold text-white uppercase tracking-wider">Sua nota para a experiência</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 hover:scale-110 transition-transform ${rating >= star ? 'text-brand-yellow drop-shadow-[0_0_8px_rgba(252,209,22,0.5)]' : 'text-dark-600'}`}
              >
                <svg width="42" height="42" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
          </div>
          <span className="text-xs text-neutral-500">{rating === 5 ? 'Excelente!' : rating >= 3 ? 'Bom' : 'Pode melhorar'}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Comentário (opcional)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow resize-none h-28"
            placeholder="Como foi o corte? E a cerveja gelada?"
          />
        </div>

        <Button type="submit" variant="primary" fullWidth className="h-12 text-base font-bold shadow-lg shadow-brand-yellow/20">
          Confirmar e Enviar
        </Button>
      </form>
    </Modal>
  );
}
