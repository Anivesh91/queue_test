import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { OrgCard } from '../../components/customer/OrgCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Search, ArrowLeft, Building2 } from 'lucide-react';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryInput, setQueryInput] = useState(search);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await orgApi.search({ search, category, city });
        setOrganizations(res?.data?.organizations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [search, category, city]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: queryInput.trim() });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Title */}
      <div className="mb-6">
        <Link
          to="/customer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discovery</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          Organization Directory & Search
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {search ? `Showing results for "${search}"` : 'Browse all registered service organizations.'}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-8 max-w-lg flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search organizations by name or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
              <LoadingSkeleton lines={3} />
            </div>
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Organizations Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try searching with different keywords or browse all categories.
          </p>
          <Link
            to="/customer"
            className="inline-block mt-4 px-4 py-2 bg-blue-50 text-blue-600 font-semibold text-xs rounded-xl hover:bg-blue-100 transition-colors"
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
