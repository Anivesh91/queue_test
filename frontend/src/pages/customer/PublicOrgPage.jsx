import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orgApi } from '../../api/orgApi';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { JoinQueueModal } from '../../components/customer/JoinQueueModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import {
  Building2,
  MapPin,
  Phone,
  ArrowLeft,
  Layers,
  AlertCircle,
  Clock,
  Radio,
} from 'lucide-react';

export const PublicOrgPage = () => {
  const { slug } = useParams();
  const { socket } = useSocket();

  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServiceForJoin, setSelectedServiceForJoin] = useState(null);

  const fetchOrganization = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError('');
      const res = await orgApi.getBySlug(slug);
      setOrganization(res?.data?.organization || null);
    } catch (err) {
      if (!isBackground) setError(err.message || 'Failed to load organization profile.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchOrganization(false);
  }, [slug, fetchOrganization]);

  // Listen to live queue events to keep service counts and statuses in sync
  useEffect(() => {
    if (!socket) return;

    const handleStatusChanged = (payload) => {
      // Optimistically update service queue status in state
      setOrganization((prev) => {
        if (!prev || !prev.services) return prev;
        const updatedServices = prev.services.map((srv) => {
          if (srv._id === payload.serviceId) {
            return {
              ...srv,
              queue: {
                ...(srv.queue || {}),
                status: payload.status,
              },
            };
          }
          return srv;
        });
        return { ...prev, services: updatedServices };
      });
      fetchOrganization(true);
    };

    const handleQueueUpdated = (payload) => {
      setOrganization((prev) => {
        if (!prev || !prev.services) return prev;
        const updatedServices = prev.services.map((srv) => {
          if (srv._id === payload.serviceId) {
            return {
              ...srv,
              waitingCount: payload.waitingCount !== undefined ? payload.waitingCount : srv.waitingCount,
              queue: {
                ...(srv.queue || {}),
                status: payload.status || srv.queue?.status,
              },
            };
          }
          return srv;
        });
        return { ...prev, services: updatedServices };
      });
      fetchOrganization(true);
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('queue:statusChanged', handleStatusChanged);
    socket.on('connect', () => fetchOrganization(true));

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('queue:statusChanged', handleStatusChanged);
    };
  }, [socket, fetchOrganization]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Organization Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error || 'This organization does not exist or is inactive.'}</p>
        <Link
          to="/customer"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold rounded-xl"
        >
          Return to Queue Finder
        </Link>
      </div>
    );
  }

  const categoryLabels = {
    HOSPITAL_CLINIC: 'Hospital & Clinic',
    SALON_BARBER: 'Salon & Barber',
    DIAGNOSTIC_CENTER: 'Diagnostic Center',
    REPAIR_SERVICE_CENTER: 'Repair & Service Center',
    CONSULTATION_CENTER: 'Consultation Center',
    OTHER: 'General Service',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <Link
        to="/customer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Queue Directory</span>
      </Link>

      {/* Organization Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-10 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50 uppercase tracking-wider">
              {categoryLabels[organization.category] || organization.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              {organization.name}
            </h1>
            {organization.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {organization.description}
              </p>
            )}

            {/* Location & Phone */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-4">
              {organization.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>
                    {organization.city} {organization.address && `— ${organization.address}`}
                  </span>
                </div>
              )}
              {organization.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{organization.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services and Queues Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Available Service Queues</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a service below to join its virtual queue and secure your position.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            {organization.services?.length || 0} Available
          </span>
        </div>

        {organization.services && organization.services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organization.services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onJoinClick={(srv) => setSelectedServiceForJoin(srv)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Services Available</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              This organization does not currently have any active services configured.
            </p>
          </div>
        )}
      </div>

      {/* Join Queue Modal */}
      <JoinQueueModal
        isOpen={!!selectedServiceForJoin}
        onClose={() => setSelectedServiceForJoin(null)}
        service={selectedServiceForJoin}
      />
    </div>
  );
};
