import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Users, LayoutDashboard, LogOut, ArrowRight, Layers, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const location = useLocation();

  const isOwnerRoute = location.pathname.startsWith('/organization') && location.pathname !== '/organization';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              QueueLess
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 rounded border border-blue-100">
              Live
            </span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            to="/customer"
            className={`transition-colors hover:text-blue-600 ${
              location.pathname.startsWith('/customer') ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Find a Queue
          </Link>
          <Link
            to="/customer/organizations"
            className="transition-colors hover:text-blue-600"
          >
            Directory
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Socket Connection Status */}
          <div
            title={isConnected ? 'Live Socket Connected' : 'Connecting to real-time server...'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 border border-slate-200 text-slate-600"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline text-[11px]">
              {isConnected ? 'Real-time' : 'Syncing'}
            </span>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/organization/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">{user?.name || 'Dashboard'}</span>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/organization/login"
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                Owner Login
              </Link>
              <Link
                to="/organization/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow"
              >
                <span>For Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
