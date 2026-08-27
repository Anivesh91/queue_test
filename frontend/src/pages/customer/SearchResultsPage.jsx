import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { OrgCard } from '../../components/customer/OrgCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import { Search, ArrowLeft, Building2, Radio } from 'lucide-react';

export const SearchResultsPage = () => {
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryInput, setQueryInput] = useState(search);

  const fetchResults = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await orgApi.search({ search, category, city });
      setOrganizations(res?.data?.organizations || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [search, category, city]);

  useEffect(() => {
    fetchResults(false);
  }, [search, category, city, fetchResults]);

  // Real-time Socket.IO Sync
  useEffect(() => {
    if (!socket) return;

    const handleQueueStatusChanged = (payload) => {
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
      fetchResults(true);
    };

    const handleQueueUpdated = () => {
      fetchResults(true);
    };

    socket.on('queue:statusChanged', handleQueueStatusChanged);
    socket.on('queue:updated', handleQueueUpdated);
    socket.on('connect', () => fetchResults(true));

    return () => {
      socket.off('queue:statusChanged', handleQueueStatusChanged);
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [socket, fetchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: queryInput.trim() });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            to="/customer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discovery</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Organization Directory & Search
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {search ? `Showing results for "${search}"` : 'Browse all registered service organizations.'}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold self-start sm:self-auto">
          <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span>Real-Time Sync</span>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-8 max-w-lg flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search organizations by name or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Organizations Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try searching with different keywords or browse all categories.
          </p>
          <Link
            to="/customer"
            className="inline-block mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Clear Search
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <OrgCard key={org._id} organization={org} />
          ))}
        </div>
      )}
    </div>
  );
};
