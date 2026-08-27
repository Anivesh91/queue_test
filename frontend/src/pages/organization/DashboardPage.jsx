import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ownerApi } from '../../api/ownerApi';
import { queueApi } from '../../api/queueApi';
import { Sidebar } from '../../components/owner/Sidebar';
import { ServiceQueueCard } from '../../components/owner/ServiceQueueCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Button } from '../../components/common/Button';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Clock,
  Layers,
  Radio,
  PlusCircle,
  Building2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinOwnerRoom } = useSocket();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingToggle, setLoadingToggle] = useState(null);

  const fetchDashboard = async () => {
    try {
      setError('');
      const res = await ownerApi.getDashboard();
      const data = res?.data;

      // If user hasn't set up organization yet, redirect to setup
      if (data && !data.hasOrganization) {
        navigate('/organization/setup');
        return;
      }

      setDashboardData(data);
      if (user?.id) {
        joinOwnerRoom(user.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  // Real-time socket events for owner dashboard
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = () => {
      fetchDashboard();
    };

    const handleStatusChanged = () => {
      fetchDashboard();
    };

    const handleTicketEvent = () => {
      fetchDashboard();
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('queue:statusChanged', handleStatusChanged);
    socket.on('ticket:called', handleTicketEvent);
    socket.on('ticket:serving', handleTicketEvent);
    socket.on('ticket:completed', handleTicketEvent);
    socket.on('ticket:cancelled', handleTicketEvent);
    socket.on('ticket:noShow', handleTicketEvent);

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('queue:statusChanged', handleStatusChanged);
      socket.off('ticket:called', handleTicketEvent);
      socket.off('ticket:serving', handleTicketEvent);
      socket.off('ticket:completed', handleTicketEvent);
      socket.off('ticket:cancelled', handleTicketEvent);
      socket.off('ticket:noShow', handleTicketEvent);
    };
  }, [socket]);

  const handleToggleQueue = async (serviceId, currentIsOpen) => {
    try {
      setLoadingToggle(serviceId);
      if (currentIsOpen) {
        await queueApi.close(serviceId);
      } else {
        await queueApi.open(serviceId);
      }
      await fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to toggle queue status.');
    } finally {
      setLoadingToggle(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="w-64 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="flex-1 p-8">
          <LoadingSkeleton lines={6} />
        </div>
      </div>
    );
  }

  const { organization, stats, serviceQueues } = dashboardData || {};

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar organization={organization} />

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl">
        {/* Top greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Operational Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live status and queue dispatching for <strong>{organization?.name}</strong>.
            </p>
          </div>

          <Link
            to="/organization/services"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Services</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Waiting Now */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Waiting Now
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {stats?.waitingNow ?? 0}
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                Across all active queues
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Currently Serving */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Currently Serving
              </div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {stats?.currentlyServing ?? 0}
              </div>
              <div className="text-[11px] text-indigo-500 dark:text-indigo-400 font-medium mt-0.5">
                At service counters
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
          </div>

          {/* Open Queues */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Open Queues
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {stats?.openQueues ?? 0}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                of {stats?.totalServices ?? 0} services
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Total Services */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
            <div>
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Services
              </div>
              <div className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-1">
                {stats?.totalServices ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Configured categories
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Service Queues List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Service Queue Consoles</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time sync enabled</span>
          </div>

          {serviceQueues && serviceQueues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceQueues.map((item) => (
                <ServiceQueueCard
                  key={item.service._id}
                  item={item}
                  onToggleQueue={handleToggleQueue}
                  loadingToggle={loadingToggle}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Services Added Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Add services to start creating virtual queues for your business.
              </p>
              <Link
                to="/organization/services"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-semibold text-xs rounded-xl"
              >
                Add First Service
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
