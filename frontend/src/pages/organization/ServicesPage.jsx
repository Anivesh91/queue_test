import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { serviceApi } from '../../api/serviceApi';
import { Sidebar } from '../../components/owner/Sidebar';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  PlayCircle,
  Clock,
  Ticket,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const ServicesPage = () => {
  const [organization, setOrganization] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    ticketPrefix: '',
    averageServiceTime: 10,
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orgApi.getMe();
      const org = res?.data?.organization;
      if (org) {
        setOrganization(org);
        const srvRes = await serviceApi.getByOrg(org._id);
        setServices(srvRes?.data?.services || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setFormData({
      name: '',
      ticketPrefix: '',
      averageServiceTime: 10,
      description: '',
    });
    setModalError('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      ticketPrefix: service.ticketPrefix || '',
      averageServiceTime: service.averageServiceTime || 10,
      description: service.description || '',
    });
    setModalError('');
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim()) {
      setModalError('Service name is required.');
      return;
    }
    if (!formData.ticketPrefix.trim()) {
      setModalError('Ticket prefix is required (e.g. A, B, GC).');
      return;
    }

    try {
      setModalLoading(true);
      await serviceApi.create(organization._id, {
        name: formData.name.trim(),
        ticketPrefix: formData.ticketPrefix.toUpperCase().trim(),
        averageServiceTime: Number(formData.averageServiceTime) || 10,
        description: formData.description.trim(),
      });
      setIsCreateModalOpen(false);
      await fetchData();
    } catch (err) {
      setModalError(err.message || 'Failed to create service.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    setModalError('');

    try {
      setModalLoading(true);
      await serviceApi.update(editingService._id, {
        name: formData.name.trim(),
        ticketPrefix: formData.ticketPrefix.toUpperCase().trim(),
        averageServiceTime: Number(formData.averageServiceTime) || 10,
        description: formData.description.trim(),
      });
      setEditingService(null);
      await fetchData();
    } catch (err) {
      setModalError(err.message || 'Failed to update service.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeactivate = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to deactivate service "${serviceName}"? New customers won't be able to join.`)) {
      return;
    }

    try {
      await serviceApi.deactivate(serviceId);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to deactivate service.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="w-64 hidden md:block bg-white border-r p-4">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="flex-1 p-8">
          <LoadingSkeleton lines={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar organization={organization} />

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Service Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create, configure, and monitor service queues for <strong>{organization?.name}</strong>.
            </p>
          </div>

          <Button variant="primary" onClick={openCreateModal}>
            <PlusCircle className="w-4 h-4" />
            <span>Add New Service</span>
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Services List Table */}
        {services.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Prefix</th>
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Avg Duration</th>
                    <th className="px-6 py-4">Queue Status</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((service) => {
                    const queue = service.queue || { status: 'CLOSED' };
                    return (
                      <tr key={service._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                            {service.ticketPrefix}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{service.name}</div>
                          {service.description && (
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {service.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          ~{service.averageServiceTime || 10} min
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={queue.status || 'CLOSED'} size="sm" />
                        </td>
                        <td className="px-6 py-4">
                          {service.isActive ? (
                            <span className="text-[11px] font-semibold text-emerald-600">Active</span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/organization/queues/${service._id}`}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Open Live Console"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => openEditModal(service)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {service.isActive && (
                              <button
                                onClick={() => handleDeactivate(service._id, service.name)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Deactivate Service"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Services Added</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add your first service to start accepting customer queue joins.
            </p>
            <Button variant="primary" onClick={openCreateModal}>
              Create Service
            </Button>
          </div>
        )}

        {/* CREATE SERVICE MODAL */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Service"
        >
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs mb-4">
              {modalError}
            </div>
          )}
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dental Checkup"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prefix (e.g. D, GC) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={formData.ticketPrefix}
                  onChange={(e) => setFormData({ ...formData, ticketPrefix: e.target.value.toUpperCase() })}
                  placeholder="D"
                  className="w-full px-4 py-2.5 font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avg Time (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  required
                  value={formData.averageServiceTime}
                  onChange={(e) => setFormData({ ...formData, averageServiceTime: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={modalLoading}>
                Create Service
              </Button>
            </div>
          </form>
        </Modal>

        {/* EDIT SERVICE MODAL */}
        <Modal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          title="Edit Service"
        >
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs mb-4">
              {modalError}
            </div>
          )}
          <form onSubmit={handleUpdateService} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prefix (Unique) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={formData.ticketPrefix}
                  onChange={(e) => setFormData({ ...formData, ticketPrefix: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avg Time (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  required
                  value={formData.averageServiceTime}
                  onChange={(e) => setFormData({ ...formData, averageServiceTime: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingService(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={modalLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
