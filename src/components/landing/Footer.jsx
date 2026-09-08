import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer({ onOpenBooking }) {
  return (
    <footer className="relative bg-dark-950 border-t border-white/10 pt-16 pb-12 overflow-hidden text-neutral-400 text-sm">
      {/* Top Colombia Accent Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="w-1/2 bg-brand-yellow" />
        <div className="w-1/4 bg-brand-blue" />
        <div className="w-1/4 bg-brand-red" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <img
              src="/logo.png"
              alt="The Latin Barber's Club"
              className="h-16 w-auto object-contain"
            />
            <p className="text-neutral-400 text-sm max-w-sm leading-relaxed">
              A verdadeira experiência latina em cuidados masculinos. Cortes clássicos, barboterapia de alta precisão e hospitalidade incomparável.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-dark-900 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-brand-yellow hover:border-brand-yellow/50 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://wa.me/5511987654321"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-xl bg-dark-900 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-emerald-400 hover:border-emerald-400/50 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#sobre" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#servicos" className="hover:text-white transition-colors">Nossos Serviços</a></li>
              <li><a href="#unidades" className="hover:text-white transition-colors">Unidades</a></li>
              <li><a href="#equipe" className="hover:text-white transition-colors">Mestres Barbeiros</a></li>
              <li><a href="#avaliacoes" className="hover:text-white transition-colors">Avaliações</a></li>
            </ul>
          </div>

          {/* Col 3: Horários & Acesso */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Atendimento</h4>
            <p className="text-xs text-neutral-300">
              Segunda a Sexta: <span className="text-white font-medium">09h00 às 20h00</span>
            </p>
            <p className="text-xs text-neutral-300">
              Sábados: <span className="text-white font-medium">09h00 às 18h00</span>
            </p>
            <div className="pt-3">
              <button
                onClick={onOpenBooking}
                className="text-xs font-bold text-brand-yellow hover:underline flex items-center gap-1"
              >
                Agendar Horário Online →
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 The Latin Barber's Club. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link
              to="/admin"
              className="text-neutral-500 hover:text-brand-yellow transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Área do Barbeiro / Painel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
