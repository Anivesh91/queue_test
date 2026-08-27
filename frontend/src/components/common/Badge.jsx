import React from 'react';

export const Badge = ({ status, text, size = 'md', className = '' }) => {
  const normalized = (status || text || '').toUpperCase();

  const styles = {
    // Queue statuses
    OPEN: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ring-emerald-500/20',
    CLOSED: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 ring-slate-400/20',

    // Ticket statuses
    WAITING: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 ring-amber-500/20',
    CALLED: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 ring-blue-500/30 font-bold animate-pulse',
    SERVING: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 ring-indigo-500/20 font-bold',
    COMPLETED: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ring-emerald-500/20',
    CANCELLED: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 ring-rose-500/20',
    NO_SHOW: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 ring-purple-500/20',

    // Category / generic
    ACTIVE: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 ring-emerald-500/20',
    INACTIVE: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 ring-slate-400/20',
    DEFAULT: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 ring-slate-400/20',
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
