import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/admin/hoje',       label: 'Agenda do Dia',   icon: CalendarTodayIcon },
  { to: '/admin/semana',     label: 'Agenda Semanal',  icon: CalendarWeekIcon },
  { to: '/admin/financeiro', label: 'Financeiro',      icon: DollarIcon },
  { to: '/admin/barbeiros',  label: 'Barbeiros',       icon: BarberIcon },
  { to: '/admin/servicos',   label: 'Serviços',        icon: ScissorsIcon },
  { to: '/admin/horarios',   label: 'Horários',        icon: ClockIcon },
  { to: '/admin/clientes',   label: 'Clientes',        icon: ClientIcon },
];

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('tlbc_admin_auth');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-dark-800 border-r border-dark-600 h-screen sticky top-0 z-40">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer overlay */}
      {onClose && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-dark-800 border-r border-dark-600 z-10 animate-slide-down">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
              <img src="/logo.png" alt="The Latin Barber's Club" className="h-8 w-auto" />
              <button
                onClick={onClose}
                aria-label="Fechar menu"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-50 hover:bg-dark-700 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent onLogout={handleLogout} isMobile onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({ onLogout, isMobile, onClose }) {
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [msg, setMsg] = React.useState({ type: '', text: '' });

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 3) {
      setMsg({ type: 'error', text: 'A senha deve ter pelo menos 3 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    localStorage.setItem('tlbc_admin_password', newPassword);
    setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setMsg({ type: '', text: '' });
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo (desktop only) */}
      {!isMobile && (
        <div className="px-5 py-5 border-b border-dark-600">
          <img src="/logo.png" alt="The Latin Barber's Club" className="h-10 w-auto" />
          <p className="text-xs text-neutral-600 mt-2 font-medium">PAINEL ADMIN</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) => `
                sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-dark-700 border border-transparent'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-brand-yellow' : 'text-neutral-500'}>
                    <item.icon />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-dark-600 space-y-1.5">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-neutral-200 hover:bg-dark-700 border border-transparent transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Trocar Senha
        </button>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:text-neutral-200 hover:bg-dark-700 border border-transparent transition-all"
        >
          <ExternalLinkIcon />
          Ver agendamento
        </a>

        <button
          onClick={onLogout}
          className="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent transition-all"
        >
          <LogoutIcon />
          Sair
        </button>
      </div>

      {/* Modal Trocar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-dark-800 border border-dark-600 rounded-3xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🔐</span> Alterar Senha de Acesso
              </h3>
              <button
                onClick={() => { setShowPasswordModal(false); setMsg({ type: '', text: '' }); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-dark-700 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-4">
              Defina a nova senha que será exigida para entrar no painel do administrador.
            </p>

            <form onSubmit={handleSavePassword} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-dark-900 border border-dark-600 text-white text-sm outline-none focus:border-brand-yellow"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-dark-900 border border-dark-600 text-white text-sm outline-none focus:border-brand-yellow"
                />
              </div>

              {msg.text && (
                <div className={`p-2.5 rounded-xl text-xs font-bold text-center ${
                  msg.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {msg.text}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setMsg({ type: '', text: '' }); }}
                  className="flex-1 h-11 rounded-xl bg-dark-700 hover:bg-dark-600 text-neutral-300 font-bold text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-brand-yellow text-dark-950 font-black text-xs uppercase hover:bg-yellow-400 shadow-md"
                >
                  Salvar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile Bottom Nav ────────────────────────────────────────────
export function BottomNav({ onOpenMenu }) {
  const primaryTabs = [
    { to: '/admin/hoje', label: 'Hoje', icon: CalendarTodayIcon },
    { to: '/admin/semana', label: 'Semana', icon: CalendarWeekIcon },
    { to: '/admin/financeiro', label: 'Finanças', icon: DollarIcon, highlight: true },
    { to: '/admin/clientes', label: 'Clientes', icon: ClientIcon },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-dark-600/80 backdrop-blur-xl bg-dark-900/95 shadow-2xl">
      <div className="flex items-center justify-around px-2 h-16 pb-safe">
        {primaryTabs.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1 h-full
              transition-all duration-200 btn-press
              ${isActive
                ? 'text-brand-yellow font-black scale-105'
                : 'text-neutral-400 hover:text-neutral-200 font-medium'
              }
            `}
          >
            <item.icon />
            <span className="text-[11px] tracking-tight">{item.label}</span>
          </NavLink>
        ))}

        {/* Menu drawer button */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-neutral-400 hover:text-neutral-200 transition-colors btn-press"
          aria-label="Abrir menu completo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
          <span className="text-[11px] font-medium tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}

// ── Icons ────────────────────────────────────────────────────────
function CalendarTodayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  );
}
function CalendarWeekIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M7 14h10M7 18h10"/>
    </svg>
  );
}
function BarberIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function ScissorsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function ClientIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}
