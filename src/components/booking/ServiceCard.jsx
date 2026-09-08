import React from 'react';
import { formatPrice } from '../../lib/storage';

export default function ServiceCard({ service, selected, onSelect }) {
  const durationLabel = service.duration_minutes >= 60
    ? `${Math.floor(service.duration_minutes / 60)}h${service.duration_minutes % 60 > 0 ? ` ${service.duration_minutes % 60}min` : ''}`
    : `${service.duration_minutes}min`;

  return (
    <button
      onClick={() => onSelect(service)}
      aria-pressed={selected}
      aria-label={`Selecionar serviço ${service.name} — ${formatPrice(service.price)}`}
      className={`
        group relative w-full text-left rounded-xl border overflow-hidden
        transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer btn-press
        focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2
        ${selected
          ? 'border-brand-yellow bg-brand-yellow/5 shadow-glow-yellow'
          : 'border-dark-500 bg-dark-800/80 hover:border-dark-400 hover:bg-dark-700/60'
        }
      `}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Radio circle */}
        <div
          className={`
            shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
            transition-all duration-200
            ${selected ? 'border-brand-yellow bg-brand-yellow' : 'border-dark-400 group-hover:border-dark-300'}
          `}
        >
          {selected && (
            <div className="w-2 h-2 rounded-full bg-dark-900" />
          )}
        </div>

        {/* Name + Description */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm leading-tight transition-colors duration-200 ${selected ? 'text-brand-yellow' : 'text-neutral-100 group-hover:text-white'}`}>
            {service.name}
          </p>
          {service.description && (
            <p className="text-xs text-neutral-600 mt-0.5 leading-snug line-clamp-1">
              {service.description}
            </p>
          )}
        </div>

        {/* Price + Duration */}
        <div className="shrink-0 text-right ml-2">
          <p className={`text-sm font-bold tabular-nums transition-colors duration-200 ${selected ? 'text-brand-yellow' : 'text-neutral-200'}`}>
            {formatPrice(service.price)}
          </p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-2xs text-neutral-600 tabular-nums">{durationLabel}</span>
          </div>
        </div>
      </div>

      {/* Selected accent */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-yellow rounded-r-full" />
      )}
    </button>
  );
}
