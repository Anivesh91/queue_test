import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { queueApi } from '../../api/queueApi';
import { ticketApi } from '../../api/ticketApi';
import { orgApi } from '../../api/orgApi';
import { Sidebar } from '../../components/owner/Sidebar';
import { QueueControlPanel } from '../../components/owner/QueueControlPanel';
import { WaitingCustomerList } from '../../components/owner/WaitingCustomerList';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const QueueConsolePage = () => {
  const { serviceId } = useParams();
  const { socket, joinServiceRoom, leaveServiceRoom } = useSocket();

  const [organization, setOrganization] = useState(null);
  const [service, setService] = useState(null);
  const [queue, setQueue] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [waitingTickets, setWaitingTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchManageData = async () => {
    try {
      setError('');
      const [res, orgRes] = await Promise.all([
        queueApi.getManage(serviceId),
        orgApi.getMe(),
      ]);

      const data = res?.data;
      setService(data?.service || null);
      setQueue(data?.queue || null);
      setCurrentTicket(data?.currentTicket || null);
      setWaitingTickets(data?.waitingTickets || []);
      setOrganization(orgRes?.data?.organization || null);
    } catch (err) {
      setError(err.message || 'Failed to load queue console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManageData();
    joinServiceRoom(serviceId);

    return () => {
      leaveServiceRoom(serviceId);
    };
  }, [serviceId]);

  // Real-time Socket.IO sync
  useEffect(() => {
    if (!socket) return;

    const handleSync = () => {
      fetchManageData();
    };

    socket.on('queue:updated', handleSync);
    socket.on('queue:statusChanged', handleSync);
    socket.on('ticket:called', handleSync);
    socket.on('ticket:serving', handleSync);
    socket.on('ticket:completed', handleSync);
    socket.on('ticket:cancelled', handleSync);
    socket.on('ticket:noShow', handleSync);

    return () => {
      socket.off('queue:updated', handleSync);
      socket.off('queue:statusChanged', handleSync);
      socket.off('ticket:called', handleSync);
      socket.off('ticket:serving', handleSync);
      socket.off('ticket:completed', handleSync);
      socket.off('ticket:cancelled', handleSync);
      socket.off('ticket:noShow', handleSync);
    };
  }, [socket, serviceId]);

  const handleToggleQueue = async () => {
    try {
      setActionLoading('toggleQueue');
      const isOpen = queue?.status === 'OPEN';
      if (isOpen) {
        await queueApi.close(serviceId);
      } else {
        await queueApi.open(serviceId);
      }
      await fetchManageData();
    } catch (err) {
      alert(err.message || 'Failed to toggle queue.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCallNext = async () => {
    try {
      setActionLoading('callNext');
      await queueApi.callNext(serviceId);
      await fetchManageData();
    } catch (err) {
      alert(err.message || 'Failed to call next ticket.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartServing = async (ticketId) => {
    try {
      setActionLoading('startServing');
      await ticketApi.start(ticketId);
      await fetchManageData();
    } catch (err) {
      alert(err.message || 'Failed to start serving ticket.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (ticketId) => {
    try {
      setActionLoading('complete');
      await ticketApi.complete(ticketId);
      await fetchManageData();
    } catch (err) {
      alert(err.message || 'Failed to complete ticket.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoShow = async (ticketId) => {
    if (!window.confirm('Are you sure you want to mark this customer as NO SHOW?')) {
      return;
    }
    try {
      setActionLoading('markNoShow');
      await ticketApi.markNoShow(ticketId);
      await fetchManageData();
    } catch (err) {
      alert(err.message || 'Failed to mark ticket as no-show.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="w-64 hidden md:block bg-white border-r p-4">
          <LoadingSkeleton lines={4} />
        </div>
        <div className="flex-1 p-8">
          <LoadingSkeleton lines={8} />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Queue Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'Could not load service queue.'}</p>
        <Link
          to="/organization/dashboard"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar organization={organization} />

      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <Link
          to="/organization/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Live Operational Console */}
        <div className="space-y-8">
          <QueueControlPanel
            service={service}
            queue={queue}
            currentTicket={currentTicket}
            waitingCount={waitingTickets.length}
            onToggleQueue={handleToggleQueue}
            onCallNext={handleCallNext}
            onStartServing={handleStartServing}
            onComplete={handleComplete}
            onNoShow={handleNoShow}
            actionLoading={actionLoading}
          />

          {/* Real-time Waiting List */}
          <div>
            <WaitingCustomerList
              waitingTickets={waitingTickets}
              avgServiceTime={service.averageServiceTime || 10}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
