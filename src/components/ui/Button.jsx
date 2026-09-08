import React from 'react';

const variants = {
  primary:   'bg-brand-yellow text-dark-900 hover:bg-brand-yellow-light font-semibold shadow-glow-yellow',
  secondary: 'bg-dark-700 text-neutral-100 hover:bg-dark-600 border border-dark-400',
  ghost:     'bg-transparent text-neutral-300 hover:bg-dark-700 hover:text-neutral-50',
  danger:    'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30',
  outline:   'bg-transparent text-brand-yellow border border-brand-yellow/50 hover:bg-brand-yellow/10',
};

const sizes = {
  xs: 'px-3 py-1.5 text-xs rounded-lg min-h-[32px]',
  sm: 'px-4 py-2 text-sm rounded-lg min-h-[36px]',
  md: 'px-5 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-xl min-h-[48px]',
  xl: 'px-8 py-4 text-base rounded-xl min-h-[56px]',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 ease-out
        cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        active:scale-[0.97]
        focus-visible:outline-2 focus-visible:outline-brand-yellow focus-visible:outline-offset-2
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          <span>{typeof loading === 'string' ? loading : children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
}
