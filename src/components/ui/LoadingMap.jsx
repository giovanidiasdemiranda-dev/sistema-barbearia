import React from 'react';

export default function LoadingMap() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 animate-fade-in select-none">
      {/* Map Graphic Container */}
      <div className="relative w-60 h-72 sm:w-72 sm:h-84 flex items-center justify-center mb-6 overflow-hidden rounded-3xl p-2 bg-dark-950/40 border border-white/5 shadow-2xl">
        
        {/* Glowing backdrop atmosphere */}
        <div className="absolute top-10 left-10 w-36 h-36 bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-6 w-36 h-36 bg-[#003893]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-6 left-1/3 w-36 h-36 bg-[#CE1126]/20 rounded-full blur-3xl pointer-events-none" />

        {/* 100% Original Colored Dotted Colombia Map */}
        <img
          src="/colombia-map.png"
          alt="Mapa da Colômbia"
          className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        />

        {/* ─── LUZ ANDANDO PELOS PONTINHOS (Scanning Wave Beam) ─── */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl">
          {/* Diagonal high-speed shimmer beam */}
          <div
            className="absolute -inset-full w-[250%] h-[250%] bg-gradient-to-b from-transparent via-white/25 to-transparent -rotate-45"
            style={{
              animation: 'lightSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />

          {/* Horizontal scanning laser line */}
          <div
            className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-[0_0_15px_#FCD116]"
            style={{
              animation: 'verticalScan 2.4s ease-in-out infinite alternate',
            }}
          />
        </div>

        {/* ─── PONTOS DE LUZ INTERATIVOS (Lojas / Cidades) ─────── */}
        {/* Ponto 1: Sede Principal (Amarelo / Bogotá) */}
        <div className="absolute top-[48%] left-[46%] z-30 pointer-events-none">
          <span className="absolute -inset-2 rounded-full bg-brand-yellow/30 animate-ping" style={{ animationDuration: '1.4s' }} />
          <span className="relative flex h-3.5 w-3.5 rounded-full bg-brand-yellow shadow-[0_0_15px_#FCD116] border-2 border-dark-900" />
          <span className="absolute -bottom-5 -left-4 text-[9px] font-black uppercase tracking-wider text-brand-yellow bg-dark-950/80 px-1.5 py-0.5 rounded border border-brand-yellow/30 whitespace-nowrap">
            Sede
          </span>
        </div>

        {/* Ponto 2: Filial Central (Azul / Medellín) */}
        <div className="absolute top-[38%] left-[38%] z-30 pointer-events-none">
          <span className="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
          <span className="relative flex h-3.5 w-3.5 rounded-full bg-blue-500 shadow-[0_0_15px_#3B82F6] border-2 border-dark-900" />
          <span className="absolute -bottom-5 -left-4 text-[9px] font-black uppercase tracking-wider text-blue-400 bg-dark-950/80 px-1.5 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">
            Filial
          </span>
        </div>

        {/* Ponto 3: Unidade Sul (Vermelho / Cali) */}
        <div className="absolute top-[54%] left-[35%] z-30 pointer-events-none">
          <span className="absolute -inset-1.5 rounded-full bg-brand-red/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
          <span className="relative flex h-2.5 w-2.5 rounded-full bg-brand-red shadow-[0_0_12px_#CE1126] border-2 border-dark-900" />
        </div>

        {/* Linhas de Conexão com Luz Viajando entre os Pontos */}
        <svg className="absolute inset-0 w-full h-full z-25 pointer-events-none">
          <defs>
            <linearGradient id="colombiaLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FCD116" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Rota Medellín -> Bogotá */}
          <path
            d="M 38% 38% Q 43% 42% 46% 48%"
            fill="none"
            stroke="url(#colombiaLine)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="animate-[dash_1s_linear_infinite]"
          />

          {/* Partícula de luz viajando pelo traçado */}
          <circle r="3" fill="#FCD116" filter="url(#glow)">
            <animateMotion
              path="M 38% 38% Q 43% 42% 46% 48%"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Rota Bogotá -> Cali */}
          <path
            d="M 46% 48% Q 40% 52% 35% 54%"
            fill="none"
            stroke="#CE1126"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeOpacity="0.6"
          />
          <circle r="2.5" fill="#CE1126" filter="url(#glow)">
            <animateMotion
              path="M 46% 48% Q 40% 52% 35% 54%"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Status Text with Colombia Dots */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs sm:text-sm font-black text-neutral-100 tracking-widest uppercase flex items-center gap-2">
          <span>Localizando Unidades</span>
        </p>

        {/* Animated Tricolor Loading Dots */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-brand-yellow animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-red animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <style>{`
        @keyframes lightSweep {
          0% { transform: translateY(-100%) rotate(25deg); opacity: 0; }
          30% { opacity: 0.9; }
          70% { opacity: 0.9; }
          100% { transform: translateY(120%) rotate(25deg); opacity: 0; }
        }
        @keyframes verticalScan {
          0% { top: 10%; opacity: 0.2; }
          50% { opacity: 0.9; }
          100% { top: 85%; opacity: 0.2; }
        }
        @keyframes dash {
          to { stroke-dashoffset: -8; }
        }
      `}</style>
    </div>
  );
}
