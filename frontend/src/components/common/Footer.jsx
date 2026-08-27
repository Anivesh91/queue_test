import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">QueueLess</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">— Virtual Queue System</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Link to="/customer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Find Queues
            </Link>
            <Link to="/organization/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Owner Portal
            </Link>
            <span>&copy; {new Date().getFullYear()} QueueLess MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
