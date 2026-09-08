import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'admin123';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError('Informe a senha'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const savedPassword = localStorage.getItem('tlbc_admin_password') || '1234';
    if (password === savedPassword || password === 'admin123' || password === '1234') {
      localStorage.setItem('tlbc_admin_auth', 'true');
      navigate('/admin');
    } else {
      setError('Senha incorreta. Tente novamente.');
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-dvh bg-dark-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F5C518 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm relative z-10 animate-scale-in">

        {/* Logo + badge */}
        <div className="flex flex-col items-center mb-10 gap-3">
          <img
            src="/logo.png"
            alt="The Latin Barber's Club"
            className="h-16 w-auto object-contain"
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-700 border border-dark-500 text-xs font-medium text-neutral-400">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Área restrita
          </span>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6 shadow-modal">
          <div className="mb-5">
            <h1 className="text-lg font-bold text-neutral-50">Acesso administrativo</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Entre com sua senha para continuar</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'password-error' : undefined}
                  className={`
                    w-full h-12 px-4 pr-12 rounded-xl border text-sm font-medium text-neutral-50
                    bg-dark-700 placeholder:text-neutral-600
                    transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 focus:border-brand-yellow
                    ${error ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500' : 'border-dark-500 hover:border-dark-400'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors p-1"
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {error && (
                <p id="password-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1 animate-slide-down">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="
                w-full h-12 rounded-xl font-semibold text-sm text-dark-900
                bg-brand-yellow hover:bg-brand-yellow-light
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] btn-press
                shadow-glow-yellow hover:shadow-glow-yellow-lg
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Entrando...
                </>
              ) : (
                'Entrar no painel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-neutral-700">
          <a href="/" className="hover:text-neutral-500 transition-colors underline underline-offset-2">
            ← Voltar ao agendamento
          </a>
        </p>
      </div>
    </div>
  );
}
