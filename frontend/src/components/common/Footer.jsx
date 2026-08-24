import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800">QueueLess</span>
            <span className="text-xs text-slate-500">— Virtual Queue System</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <Link to="/customer" className="hover:text-blue-600 transition-colors">
              Find Queues
            </Link>
            <Link to="/organization/login" className="hover:text-blue-600 transition-colors">
              Owner Portal
            </Link>
            <span>&copy; {new Date().getFullYear()} QueueLess MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
