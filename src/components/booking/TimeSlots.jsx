import React, { useEffect, useState } from 'react';
import { getAvailableSlots } from '../../lib/storage';

export default function TimeSlots({ barberId, date, durationMinutes, selectedTime, onSelectTime }) {
  const [slots, setSlots]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barberId || !date || !durationMinutes) return;
    setLoading(true);
    const t = setTimeout(() => {
      setSlots(getAvailableSlots(barberId, date, durationMinutes));
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [barberId, date, durationMinutes]);

  const available = slots.filter(s => s.available);
  const unavailable = slots.filter(s => !s.available);

  if (loading) {
    return (
      <div>
        <p className="text-xs text-neutral-600 mb-3 font-medium">Carregando horários...</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-11 rounded-xl" style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-dark-700 border border-dark-500 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-400">Sem horários disponíveis</p>
          <p className="text-xs text-neutral-600 mt-1">Tente outra data ou barbeiro</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Available */}
      <div className="mb-1">
        <p className="text-xs text-neutral-500 font-medium mb-3">
          {available.length} horário{available.length !== 1 ? 's' : ''} disponível{available.length !== 1 ? 'is' : ''}
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {available.map((slot, i) => {
            const isSelected = slot.time === selectedTime;
            return (
              <button
                key={slot.time}
                onClick={() => onSelectTime(slot.time)}
                aria-label={`Horário ${slot.time}`}
                aria-pressed={isSelected}
                className={`
                  time-chip h-11 rounded-xl text-sm font-semibold tabular-nums
                  border transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]
                  focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2
                  animate-stagger-item
                  ${isSelected
                    ? 'bg-brand-yellow border-brand-yellow text-dark-900 shadow-glow-yellow scale-105'
                    : 'bg-dark-700/60 border-dark-500 text-neutral-200 hover:border-dark-400 hover:bg-dark-700 hover:text-white'
                  }
                `}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unavailable — collapsed */}
      {unavailable.length > 0 && (
        <details className="mt-5">
          <summary className="text-xs text-neutral-700 cursor-pointer hover:text-neutral-500 transition-colors list-none flex items-center gap-1.5 w-fit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
            Ver {unavailable.length} horário{unavailable.length !== 1 ? 's' : ''} indisponível{unavailable.length !== 1 ? 'is' : ''}
          </summary>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
            {unavailable.map(slot => (
              <div
                key={slot.time}
                className="h-11 rounded-xl text-sm font-medium tabular-nums border border-dark-600/50 bg-dark-800/30 text-neutral-700 flex items-center justify-center line-through decoration-neutral-700"
              >
                {slot.time}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
