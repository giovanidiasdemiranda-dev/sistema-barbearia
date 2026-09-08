import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Toast Context ─────────────────────────────────────────────────
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Toast Component ───────────────────────────────────────────────
const TOAST_ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" />
    </svg>
  ),
};

const TOAST_STYLES = {
  success: 'bg-dark-700 border-green-500/30 text-green-400',
  error:   'bg-dark-700 border-red-500/30 text-red-400',
  info:    'bg-dark-700 border-brand-yellow/30 text-brand-yellow',
  warning: 'bg-dark-700 border-yellow-500/30 text-yellow-400',
};

function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notificações"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-modal ${TOAST_STYLES[toast.type]}`}
        >
          <span className="shrink-0">{TOAST_ICONS[toast.type]}</span>
          <span className="text-sm font-medium text-neutral-50 flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            aria-label="Fechar"
            className="shrink-0 text-neutral-400 hover:text-neutral-200 transition-colors ml-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
