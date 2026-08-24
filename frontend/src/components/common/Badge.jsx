import React from 'react';

export const Badge = ({ status, text, size = 'md', className = '' }) => {
  const normalized = (status || text || '').toUpperCase();

  const styles = {
    // Queue statuses
    OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/20',

    // Ticket statuses
    WAITING: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    CALLED: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30 font-bold animate-pulse',
    SERVING: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20 font-bold',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    NO_SHOW: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',

    // Category / generic
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/20',
    DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-400/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  const style = styles[normalized] || styles.DEFAULT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 font-medium tracking-wide ${style} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          normalized === 'OPEN' || normalized === 'COMPLETED'
            ? 'bg-emerald-500'
            : normalized === 'CALLED'
            ? 'bg-blue-500 animate-ping'
            : normalized === 'SERVING'
            ? 'bg-indigo-500'
            : normalized === 'WAITING'
            ? 'bg-amber-500'
            : normalized === 'CANCELLED'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {text || normalized}
    </span>
  );
};
