import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { serviceApi } from '../../api/serviceApi';
import { Button } from '../../components/common/Button';
import { Building2, Layers, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'HOSPITAL_CLINIC', label: 'Hospital & Clinic' },
  { id: 'SALON_BARBER', label: 'Salon & Barber' },
  { id: 'DIAGNOSTIC_CENTER', label: 'Diagnostic Center' },
  { id: 'REPAIR_SERVICE_CENTER', label: 'Repair & Service Center' },
  { id: 'CONSULTATION_CENTER', label: 'Consultation Center' },
  { id: 'OTHER', label: 'Other Service' },
];

export const OrgSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Org Data
  const [orgData, setOrgData] = useState({
    name: '',
    category: 'HOSPITAL_CLINIC',
    city: '',
    address: '',
    phone: '',
    description: '',
  });

  // Step 2: First Service Data
  const [serviceData, setServiceData] = useState({
    name: '',
    ticketPrefix: 'A',
    averageServiceTime: 10,
    description: '',
  });

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!orgData.name.trim()) {
      setError('Organization name is required.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinishSetup = async (e) => {
    e.preventDefault();
    setError('');

    if (!serviceData.name.trim()) {
      setError('First service name is required.');
      return;
    }

    if (!serviceData.ticketPrefix.trim()) {
      setError('Ticket prefix is required (e.g. A, GC, D).');
      return;
    }

    try {
      setLoading(true);

      // 1. Create Organization
      const orgRes = await orgApi.create({
        name: orgData.name.trim(),
        category: orgData.category,
        city: orgData.city.trim(),
        address: orgData.address.trim(),
        phone: orgData.phone.trim(),
        description: orgData.description.trim(),
      });

      const newOrg = orgRes?.data?.organization;

      // 2. Create First Service under this organization
      if (newOrg?._id) {
        await serviceApi.create(newOrg._id, {
          name: serviceData.name.trim(),
          ticketPrefix: serviceData.ticketPrefix.toUpperCase().trim(),
          averageServiceTime: Number(serviceData.averageServiceTime) || 10,
          description: serviceData.description.trim(),
        });
      }

      navigate('/organization/dashboard');
    } catch (err) {
      setError(err.message || 'Setup failed. Please review your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Step Progress Indicators */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-semibold ${step >= 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
            Organization Profile
          </span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-semibold ${step >= 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
            First Service Queue
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors duration-200">
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: ORGANIZATION INFO */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 1: Set up your Organization</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your business details so customers can discover and identify your queues.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                placeholder="e.g. CityCare Health Clinic"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={orgData.category}
                onChange={(e) => setOrgData({ ...orgData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={orgData.city}
                  onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={orgData.phone}
                  onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address / Landmark</label>
              <input
                type="text"
                value={orgData.address}
                onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                placeholder="e.g. 42 Park Avenue, Suite 101"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">About / Description</label>
              <textarea
                rows={2}
                value={orgData.description}
                onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                placeholder="Brief summary of services and operating details..."
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="lg">
                <span>Continue to Service Setup</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: FIRST SERVICE INFO */}
        {step === 2 && (
          <form onSubmit={handleFinishSetup} className="space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 2: Add your First Service Queue</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Each service automatically gets its own FIFO queue. You can add more services later.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={serviceData.name}
                onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                placeholder="e.g. General Consultation"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ticket Prefix <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={serviceData.ticketPrefix}
                  onChange={(e) => setServiceData({ ...serviceData, ticketPrefix: e.target.value.toUpperCase() })}
                  placeholder="e.g. GC, A, DOC"
                  className="w-full px-4 py-2.5 font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Tickets will appear as {serviceData.ticketPrefix || 'A'}-001, {serviceData.ticketPrefix || 'A'}-002.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Avg. Service Time (Minutes) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  required
                  value={serviceData.averageServiceTime}
                  onChange={(e) => setServiceData({ ...serviceData, averageServiceTime: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Service Description</label>
              <textarea
                rows={2}
                value={serviceData.description}
                onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                placeholder="Optional description of this service..."
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(1)} disabled={loading}>
                Back to Org Details
              </Button>
              <Button type="submit" variant="primary" size="lg" loading={loading}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Setup & Open Dashboard</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
