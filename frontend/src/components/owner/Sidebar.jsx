import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, Building2, ExternalLink, Radio } from 'lucide-react';

export const Sidebar = ({ organization }) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/organization/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Services & Queues',
      path: '/organization/services',
      icon: Layers,
    },
    {
      label: 'Organization Profile',
      path: '/organization/profile',
      icon: Building2,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 transition-colors duration-200">
      <div className="space-y-6">
        {/* Org Banner */}
        {organization && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Organization
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {organization.name}
            </div>
            {organization.slug && (
              <a
                href={`/customer/organizations/${organization.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-2"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Live System Indicator */}
      <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
        <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0" />
        <div>
          <div className="font-bold text-[11px]">Real-Time Active</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Syncing live queue events</div>
        </div>
      </div>
    </aside>
  );
};
