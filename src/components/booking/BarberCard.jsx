import React, { useState } from 'react';

const BARBER_THEMES = {
  'barber-1': {
    color: '#FCD116',
    borderSelected: 'border-brand-yellow bg-brand-yellow/10 shadow-glow-yellow',
    tagBg: 'bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30',
    tagText: 'Cortes Clássicos',
    badgeBg: 'bg-brand-yellow text-dark-950',
    textHighlight: 'text-brand-yellow',
  },
  'barber-2': {
    color: '#3B82F6',
    borderSelected: 'border-blue-500 bg-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.3)]',
    tagBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    tagText: 'Especialista em Barba',
    badgeBg: 'bg-blue-500 text-white',
    textHighlight: 'text-blue-400',
  },
  'barber-3': {
    color: '#CE1126',
    borderSelected: 'border-brand-red bg-brand-red/10 shadow-[0_0_25px_rgba(206,17,38,0.3)]',
    tagBg: 'bg-brand-red/15 text-red-400 border border-brand-red/30',
    tagText: 'Skin Fade & Moderno',
    badgeBg: 'bg-brand-red text-white',
    textHighlight: 'text-red-400',
  },
};

export default function BarberCard({ barber, selected, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const initials = barber.initials || barber.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const theme = BARBER_THEMES[barber.id] || BARBER_THEMES['barber-1'];

  return (
    <button
      onClick={() => onSelect(barber)}
      aria-pressed={selected}
      aria-label={`Selecionar barbeiro ${barber.name}`}
      className={`
        group relative w-full text-left rounded-2xl border overflow-hidden
        transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer btn-press
        focus-visible:outline-2 focus-visible:outline-offset-2
        ${selected
          ? theme.borderSelected
          : 'border-dark-500 bg-dark-800/80 hover:border-dark-400 hover:bg-dark-700/80'
        }
      `}
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          {barber.photo_url && !imgError ? (
            <img
              src={barber.photo_url}
              alt={barber.name}
              onError={() => setImgError(true)}
              className="w-20 h-24 rounded-2xl object-cover border-2 shadow-md"
              style={{ borderColor: selected ? theme.color : 'rgba(255,255,255,0.1)' }}
            />
          ) : (
            <div
              className="w-20 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-dark-900 shrink-0 border-2"
              style={{
                backgroundColor: theme.color,
                borderColor: selected ? theme.color : 'rgba(255,255,255,0.1)',
                boxShadow: selected ? `0 0 20px ${theme.color}40` : 'none',
              }}
            >
              {initials}
            </div>
          )}

          {/* Selected badge */}
          {selected && (
            <div
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center animate-scale-in shadow-md"
              style={{ backgroundColor: theme.color }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className={`font-black text-base leading-tight transition-colors duration-200 ${selected ? theme.textHighlight : 'text-neutral-50 group-hover:text-white'}`}>
              {barber.name}
            </p>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${theme.tagBg}`}>
              {theme.tagText}
            </span>
          </div>

          <p className="text-sm text-neutral-400 mt-1 leading-snug line-clamp-2">
            {barber.bio}
          </p>
        </div>

        {/* Arrow */}
        <div className={`shrink-0 transition-all duration-200 ${selected ? theme.textHighlight + ' translate-x-0.5' : 'text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>

      {/* Selected accent side bar */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ backgroundColor: theme.color }} />
      )}
    </button>
  );
}
