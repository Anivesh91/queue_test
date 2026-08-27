import React, { useState, useEffect, useCallback } from 'react';
import { orgApi } from '../../api/orgApi';
import { OrgCard } from '../../components/customer/OrgCard';
import { FindTicketModal } from '../../components/customer/FindTicketModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import { Search, MapPin, Filter, Layers, AlertCircle, Building2, Radio, Ticket } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'HOSPITAL_CLINIC', label: '🏥 Hospital & Clinic' },
  { id: 'SALON_BARBER', label: '✂️ Salon & Barber' },
  { id: 'DIAGNOSTIC_CENTER', label: '🔬 Diagnostic Center' },
  { id: 'REPAIR_SERVICE_CENTER', label: '🔧 Repair & Service' },
  { id: 'CONSULTATION_CENTER', label: '💼 Consultation' },
  { id: 'OTHER', label: '🏢 Other Services' },
];

export const CustomerHomePage = () => {
  const { socket, isConnected } = useSocket();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [city, setCity] = useState('');
  const [isFindTicketOpen, setIsFindTicketOpen] = useState(false);

  const fetchOrganizations = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError('');
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;
      if (city.trim()) params.city = city.trim();

      const res = await orgApi.search(params);
      setOrganizations(res?.data?.organizations || []);
    } catch (err) {
      if (!isBackground) setError(err.message || 'Failed to load organizations.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [searchTerm, selectedCategory, city]);

  useEffect(() => {
    fetchOrganizations(false);
  }, [selectedCategory, fetchOrganizations]);

  // Real-Time Socket.IO Synchronization for Live Queue Status & Counts
  useEffect(() => {
    if (!socket) return;

    const handleQueueStatusChanged = (payload) => {
      // Optimistically update the organization's open queues count
      setOrganizations((prevOrgs) =>
        prevOrgs.map((org) => {
          if (org._id === payload.organizationId) {
            let currentOpen = org.openQueuesCount || 0;
            if (payload.status === 'OPEN') {
              currentOpen = Math.min(currentOpen + 1, org.servicesCount || 99);
            } else if (payload.status === 'CLOSED') {
              currentOpen = Math.max(0, currentOpen - 1);
            }
            return { ...org, openQueuesCount: currentOpen };
          }
          return org;
        })
      );
      // Background re-fetch to ensure perfect consistency
      fetchOrganizations(true);
    };

    const handleQueueUpdated = () => {
      fetchOrganizations(true);
    };

    socket.on('queue:statusChanged', handleQueueStatusChanged);
    socket.on('queue:updated', handleQueueUpdated);
    socket.on('connect', () => fetchOrganizations(true));

    return () => {
      socket.off('queue:statusChanged', handleQueueStatusChanged);
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [socket, fetchOrganizations]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrganizations(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Find a Virtual Queue
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Search registered businesses, check live waiting times, and join remotely.
          </p>
        </div>

        {/* Action pills */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsFindTicketOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Find My Ticket</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Live Queue Sync</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4 transition-colors duration-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main search input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by business name or service..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* City filter input */}
          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city (e.g. Mumbai, New York)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      ) : organizations.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto my-8">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Organizations Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No active businesses matched your search filters. Try clearing your search or city filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCity('');
              setSelectedCategory('ALL');
            }}
            className="mt-5 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Organizations Grid */
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Showing {organizations.length} {organizations.length === 1 ? 'business' : 'businesses'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <OrgCard key={org._id} organization={org} />
            ))}
          </div>
        </div>
      )}

      {/* Find My Ticket Modal */}
      <FindTicketModal isOpen={isFindTicketOpen} onClose={() => setIsFindTicketOpen(false)} />
    </div>
  );
};
