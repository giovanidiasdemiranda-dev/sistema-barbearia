import React from 'react';

export default function ShopCard({ shop, selected, onSelect }) {
  const isShop1 = shop.id === 'shop-1';
  const themeColor = isShop1 ? '#FCD116' : '#3B82F6';
  const dotColor = isShop1 ? 'bg-brand-yellow' : 'bg-blue-500';

  return (
    <button
      onClick={() => onSelect(shop)}
      aria-pressed={selected}
      aria-label={`Selecionar unidade ${shop.name}`}
      className={`
        group relative w-full text-left rounded-2xl border p-5 overflow-hidden
        transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer btn-press
        focus-visible:outline-2 focus-visible:outline-offset-2
        ${selected
          ? isShop1
            ? 'border-brand-yellow bg-brand-yellow/10 shadow-glow-yellow'
            : 'border-blue-500 bg-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.3)]'
          : 'border-dark-500 bg-dark-800/80 hover:border-dark-400 hover:bg-dark-700/80'
        }
      `}
    >
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor} ${selected ? 'animate-pulse' : ''}`} />
          <h3 className={`text-xl font-bold uppercase tracking-wide transition-colors duration-200 ${
            selected 
              ? isShop1 ? 'text-brand-yellow' : 'text-blue-400' 
              : 'text-neutral-50 group-hover:text-white'
          }`}>
            {shop.name}
          </h3>
        </div>
        <p className="text-sm text-neutral-400 flex items-center gap-2 pl-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {shop.address}
        </p>
      </div>

      {/* Decorative background element */}
      <div
        className={`
          absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none
          ${selected ? 'opacity-30' : 'opacity-0 group-hover:opacity-10'}
        `}
        style={{ backgroundColor: themeColor }}
      />
      
      {/* Selected badge */}
      {selected && (
        <div
          className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center animate-scale-in shadow-md"
          style={{ backgroundColor: themeColor }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      )}
    </button>
  );
}
