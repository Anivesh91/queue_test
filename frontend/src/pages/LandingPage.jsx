import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import {
  Users,
  Search,
  Building2,
  Clock,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/customer/organizations?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/customer');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-blue-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Next-Gen Virtual Queuing</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Skip the line.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Join virtually.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            QueueLess enables businesses to run real-time virtual queues. Customers join remotely with zero app downloads and track their turn live.
          </p>

          {/* Search Bar for Customers */}
          <div className="mt-10 max-w-xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 flex items-center gap-2"
            >
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clinics, salons, repair centers..."
                className="flex-1 px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md" className="rounded-xl">
                Find Queue
              </Button>
            </form>
          </div>

          {/* Action Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            <Link
              to="/customer"
              className="inline-flex items-center gap-2 px-5 py-3 text-slate-700 hover:text-blue-600 bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow transition-all"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Browse All Queues</span>
            </Link>
            <Link
              to="/organization/login"
              className="inline-flex items-center gap-2 px-5 py-3 text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 rounded-xl transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Manage My Organization</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How QueueLess Works
            </h2>
            <p className="mt-3 text-slate-600 text-sm">
              Frictionless queue management for customers and business owners alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 relative">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-blue-500/20 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Find a Service</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Discover clinics, barbers, consultation centers, and repair shops. Check live waiting counts and estimated wait times in real-time.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-indigo-500/20 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Join as Guest</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No signups, passwords, or app downloads. Just enter your name and phone to receive a live digital ticket instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-emerald-500/20 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Track Live & Arrive</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Watch your position update live via WebSocket. Get alerted the instant your ticket is called and walk right up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Owner CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold rounded-full uppercase tracking-wider">
                For Service Providers
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight">
                Digitize your physical queue in under 2 minutes.
              </h2>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Eliminate crowded waiting rooms. Create services, open queues, call next customers with 1 click, and boost customer satisfaction effortlessly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Link
                to="/organization/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-lg"
              >
                <span>Register Organization</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/organization/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
              >
                Owner Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
