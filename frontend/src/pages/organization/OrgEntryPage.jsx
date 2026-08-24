import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ArrowRight, ShieldCheck, Users, Zap } from 'lucide-react';

export const OrgEntryPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/organization/dashboard" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 mb-6">
        <Building2 className="w-8 h-8" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        Organization Owner Portal
      </h1>
      <p className="text-slate-600 text-base mt-3 max-w-xl mx-auto">
        Create and operate high-efficiency virtual queues for your business. Provide your customers with zero-friction live turn tracking.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
        {/* Register Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              New Business
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-3">Register Organization</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create an owner account and set up your business services in 2 minutes.
            </p>
          </div>
          <Link
            to="/organization/register"
            className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between text-left">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              Existing Owner
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-3">Owner Login</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage your active queues, call next customers, and update services.
            </p>
          </div>
          <Link
            to="/organization/login"
            className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-all"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
