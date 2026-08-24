import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceApi } from '../../api/serviceApi';
import { queueApi } from '../../api/queueApi';
import { JoinQueueModal } from '../../components/customer/JoinQueueModal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import {
  Users,
  Clock,
  Ticket,
  Building2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ServiceQueuePage = () => {
  const { serviceId } = useParams();
  const { socket, joinServiceRoom, leaveServiceRoom } = useSocket();

  const [service, setService] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [serviceRes, queueRes] = await Promise.all([
        serviceApi.getById(serviceId),
        queueApi.getPublic(serviceId),
      ]);
      setService(serviceRes?.data?.service || null);
      setQueueData(queueRes?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load service queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    joinServiceRoom(serviceId);

    return () => {
      leaveServiceRoom(serviceId);
    };
  }, [serviceId]);

  // Live Socket.IO Updates
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = () => {
      fetchData();
    };

    const handleStatusChanged = () => {
      fetchData();
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('queue:statusChanged', handleStatusChanged);

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('queue:statusChanged', handleStatusChanged);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <LoadingSkeleton lines={5} />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Service Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'This service is inactive or not found.'}</p>
        <Link
          to="/customer"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          Browse All Queues
        </Link>
      </div>
    );
  }

  const isOpen = queueData?.status === 'OPEN';
  const waitingCount = queueData?.waitingCount || 0;
  const avgTime = service.averageServiceTime || 10;
  const estWait = waitingCount * avgTime;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      {service.organizationId?.slug ? (
        <Link
          to={`/customer/organizations/${service.organizationId.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {service.organizationId.name || 'Organization'}</span>
        </Link>
      ) : (
        <Link
          to="/customer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      )}

      {/* Main Service Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">
                Prefix: {service.ticketPrefix}
              </span>
              <Badge status={isOpen ? 'OPEN' : 'CLOSED'} size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {service.name}
            </h1>
            {service.organizationId?.name && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{service.organizationId.name}</span>
              </div>
            )}
          </div>
        </div>

        {service.description && (
          <p className="text-sm text-slate-600 my-6 leading-relaxed">
            {service.description}
          </p>
        )}

        {/* Live Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Waiting in line</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{waitingCount}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Estimated wait</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">
              {waitingCount > 0 ? `~${estWait} min` : '0 min'}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Avg turn time</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{avgTime} min</div>
          </div>
        </div>

        {/* Join CTA */}
        <div className="pt-2">
          {isOpen ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full py-4 text-base"
              onClick={() => setIsJoinModalOpen(true)}
            >
              <span>Join Virtual Queue Now</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-500 font-medium">
              This service queue is currently CLOSED. Please check back when the owner opens it.
            </div>
          )}
        </div>
      </div>

      <JoinQueueModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        service={service}
      />
    </div>
  );
};
