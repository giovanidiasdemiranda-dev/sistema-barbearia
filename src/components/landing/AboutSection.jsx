import React from 'react';

export default function AboutSection() {
  const highlights = [
    {
      title: 'Navalha & Toalha Quente',
      description: 'Barboterapia clássica com toalha aquecida, vapor de ozônio e óleos essenciais para uma pele impecável.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-yellow">
          <path d="M7 21a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4Zm0 0h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3" />
        </svg>
      ),
      tag: 'Tradição',
      borderColor: 'border-brand-yellow/30',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(252,209,22,0.15)]',
    },
    {
      title: 'Mestres da Arte',
      description: 'Equipe altamente treinada nas escolas clássicas e modernas, dominando desde o corte tradicional ao skin fade.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      tag: 'Excelência',
      borderColor: 'border-brand-blue/40',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(0,56,147,0.25)]',
    },
    {
      title: 'Hospitalidade & Conforto',
      description: 'Café colombiano passado na hora, cerveja artesanal como cortesia e uma playlist curada para você relaxar.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-red">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
        </svg>
      ),
      tag: 'Experiência',
      borderColor: 'border-brand-red/30',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(206,17,38,0.2)]',
    },
  ];

  return (
    <section id="sobre" className="relative py-24 md:py-32 bg-dark-900 border-t border-white/5 overflow-hidden">
      {/* Subtle background Colombia light streaks */}
      <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-brand-yellow/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-brand-blue/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 text-brand-yellow text-xs uppercase tracking-widest font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
            Nossa Essência
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
            Estilo é um reflexo da sua <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-100 to-brand-yellow">
              Atitude e Personalidade
            </span>
          </h2>
          <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
            Nascida da paixão pela alfaiataria clássica dos cortes masculinos e do calor acolhedor latino, 
            The Latin Barber's Club oferece muito mais que um corte: proporcionamos um ritual de autocuidado 
            com precisão cirúrgica e atendimento de primeira classe.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          {highlights.map((item) => (
            <div
              key={item.title}
              className={`group relative p-8 rounded-3xl bg-dark-950/60 border ${item.borderColor} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 ${item.glowColor}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-dark-800/80 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[11px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-lg bg-dark-800/80 text-neutral-400 border border-white/5">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-yellow transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Atmosphere Banner Image */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-64 md:h-80 group">
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Ambiente The Latin Barber's Club"
            className="w-full h-full object-cover object-center brightness-75 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="max-w-xl">
              <span className="text-brand-yellow font-bold text-xs uppercase tracking-widest mb-1 block">O Clube</span>
              <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
                O ambiente que você merece
              </h4>
              <p className="text-sm text-neutral-300">
                Cadeiras vintage em couro legítimo, iluminação âmbar relaxante e privacidade para você se desconectar da rotina.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
