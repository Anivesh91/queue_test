import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  Users,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate('/organization/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      const res = await googleLogin(credentialResponse.credential);
      if (res?.isNewUser) {
        navigate('/organization/setup');
      } else {
        navigate('/organization/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or encountered an issue.');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Product Showcase (Hidden on small screens) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl shadow-blue-500/20 relative overflow-hidden min-h-[580px]">
          {/* Subtle background graphics */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl" />

          <div className="relative z-10">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Queue Management Platform</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Eliminate physical waitlines with intelligent virtual queues.
            </h2>
            <p className="text-blue-100 text-sm mt-3 leading-relaxed">
              Power your business operations with zero waiting room congestion, real-time turn notifications, and multi-service counters.
            </p>

            {/* Feature Cards */}
            <div className="mt-8 space-y-3.5">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-[10px]">✓</span>
                  No Hardware or Kiosks Required
                </div>
                <p className="text-[11px] text-blue-200 mt-1 pl-7">
                  Run directly from any tablet, phone, or laptop browser.
                </p>
              </div>

              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-[10px]">✓</span>
                  Instant Customer Satisfaction
                </div>
                <p className="text-[11px] text-blue-200 mt-1 pl-7">
                  Customers wait wherever they want and receive real-time audio & visual chimes.
                </p>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="relative z-10 pt-6 border-t border-white/15 space-y-2.5 text-xs text-blue-100 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>100% Guest Customers — No App Download</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Sub-Second WebSocket Delta Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Strict FIFO Ordering & Single Active Counter</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto">
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 transition-all">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Sign in to operate your business queues and call next turns.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 mb-6 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth Section */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                  width="100%"
                  theme="filled_blue"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 absolute">
                Or sign in with email
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 py-3 font-semibold shadow-lg shadow-blue-500/25"
                loading={loading}
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            {/* Footer Registration Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
              Don't have an organization registered?{' '}
              <Link
                to="/organization/register"
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
              >
                Register Here
              </Link>
            </div>

            {/* Encrypted session note */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit encrypted session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
