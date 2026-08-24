import React, { useState, useEffect } from 'react';
import { orgApi } from '../../api/orgApi';
import { Sidebar } from '../../components/owner/Sidebar';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Building2,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'HOSPITAL_CLINIC', label: 'Hospital & Clinic' },
  { id: 'SALON_BARBER', label: 'Salon & Barber' },
  { id: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' },
  { id: 'REPAIR_SERVICE_CENTER', label: 'Repair & Service Center' },
  { id: 'CONSULTATION_CENTER', label: 'Consultation Center' },
  { id: 'OTHER', label: 'Other Service' },
];

export const ProfilePage = () => {
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'OTHER',
    city: '',
    address: '',
    phone: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await orgApi.getMe();
      const org = res?.data?.organization;
      if (org) {
        setOrganization(org);
        setFormData({
          name: org.name || '',
          category: org.category || 'OTHER',
          city: org.city || '',
          address: org.address || '',
          phone: org.phone || '',
          description: org.description || '',
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load organization profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setSaving(true);
      await orgApi.update(organization._id, formData);
      setSuccessMsg('Organization profile updated successfully.');
      await fetchProfile();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = organization?.slug
    ? `${window.location.origin}/customer/organizations/${organization.slug}`
    : '';

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="w-64 hidden md:block bg-white border-r p-4">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="flex-1 p-8">
          <LoadingSkeleton lines={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar organization={organization} />

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Organization Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your public business identity and preview customer links.
          </p>
        </div>

        {/* Public Link Card */}
        {organization?.slug && (
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Your Public Customer URL
              </div>
              <div className="text-xs text-slate-600 font-mono mt-1 break-all select-all">
                {publicUrl}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Visit Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">About / Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" loading={saving}>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
