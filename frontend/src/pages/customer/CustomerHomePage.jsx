import React, { useState, useEffect } from 'react';
import { orgApi } from '../../api/orgApi';
import { OrgCard } from '../../components/customer/OrgCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Search, MapPin, Filter, Layers, AlertCircle, Building2 } from 'lucide-react';

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
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [city, setCity] = useState('');

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;
      if (city.trim()) params.city = city.trim();

      const res = await orgApi.search(params);
      setOrganizations(res?.data?.organizations || []);
    } catch (err) {
      setError(err.message || 'Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrganizations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find a Virtual Queue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Search registered businesses, check live waiting times, and join remotely.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main search input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by business name or service..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* City filter input */}
          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city (e.g. Mumbai, New York)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      ) : organizations.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Organizations Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No active businesses matched your search filters. Try clearing your search or city filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCity('');
              setSelectedCategory('ALL');
            }}
            className="mt-5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Organizations Grid */
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Showing {organizations.length} {organizations.length === 1 ? 'business' : 'businesses'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <OrgCard key={org._id} organization={org} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
