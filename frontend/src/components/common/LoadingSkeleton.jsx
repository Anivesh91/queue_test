import React from 'react';

export const LoadingSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200/80 dark:bg-slate-800/80 rounded-md"
          style={{ width: `${85 - i * 15}%` }}
        ></div>
      ))}
    </div>
  );
};
