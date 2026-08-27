import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ticketApi } from '../../api/ticketApi';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';
import {
  Ticket as TicketIcon,
  Users,
  Clock,
  Building2,
  BellRing,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Volume2,
  Calendar,
  Share2,
} from 'lucide-react';

export const TicketTrackerPage = () => {
  const { publicToken } = useParams();
  const { socket, isConnected, joinTicketRoom, leaveTicketRoom } = useSocket();

  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [hasTriggeredChime, setHasTriggeredChime] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Play audio chime when called
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime failed to play:', e);
    }
  };

  const fetchTicket = async () => {
    try {
      setError('');
      const res = await ticketApi.track(publicToken);
      const data = res?.data;
      setTicketData(data);

      if (data?.ticket?.status === 'CALLED' && !hasTriggeredChime) {
        playChime();
        setHasTriggeredChime(true);
      }

      if (data?.ticket?.status === 'COMPLETED') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      return data;
    } catch (err) {
      setError(err.message || 'Failed to load ticket information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [publicToken]);

  // Handle Socket.IO connection & room joining
  useEffect(() => {
    if (!ticketData?.ticket?.id) return;
    const ticketId = ticketData.ticket.id;

    joinTicketRoom(publicToken, ticketId);

    if (!socket) return;

    // Listen to real-time events
    const handlePositionUpdated = (data) => {
      setTicketData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          peopleAhead: data.peopleAhead,
          estimatedWaitMinutes: data.estimatedWaitMinutes,
        };
      });
    };

    const handleCalled = (data) => {
      playChime();
      fetchTicket();
    };

    const handleServing = () => {
      fetchTicket();
    };

    const handleCompleted = () => {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      fetchTicket();
    };

    const handleCancelled = () => {
      fetchTicket();
    };

    const handleNoShow = () => {
      fetchTicket();
    };

    const handleReconnect = () => {
      fetchTicket();
    };

    socket.on('ticket:positionUpdated', handlePositionUpdated);
    socket.on('ticket:called', handleCalled);
    socket.on('ticket:serving', handleServing);
    socket.on('ticket:completed', handleCompleted);
    socket.on('ticket:cancelled', handleCancelled);
    socket.on('ticket:noShow', handleNoShow);
    socket.on('connect', handleReconnect);

    return () => {
      leaveTicketRoom(ticketId);
      socket.off('ticket:positionUpdated', handlePositionUpdated);
      socket.off('ticket:called', handleCalled);
      socket.off('ticket:serving', handleServing);
      socket.off('ticket:completed', handleCompleted);
      socket.off('ticket:cancelled', handleCancelled);
      socket.off('ticket:noShow', handleNoShow);
      socket.off('connect', handleReconnect);
    };
  }, [socket, ticketData?.ticket?.id, publicToken]);

  const handleCancelTicket = async () => {
    if (!window.confirm('Are you sure you want to leave this virtual queue? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelLoading(true);
      await ticketApi.cancel(publicToken);
      await fetchTicket();
    } catch (err) {
      alert(err.message || 'Failed to cancel ticket.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Ticket Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error || 'This ticket token is invalid or expired.'}</p>
        <Link
          to="/customer"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold rounded-xl"
        >
          Find a New Queue
        </Link>
      </div>
    );
  }

  const { ticket, service, organization, peopleAhead, estimatedWaitMinutes } = ticketData;
  const status = ticket.status;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
      {/* Live CALLED Banner */}
      {status === 'CALLED' && (
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white shadow-xl shadow-blue-500/25 animate-bounce-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <BellRing className="w-6 h-6 text-white animate-wiggle" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              It's your turn!
            </div>
            <div className="text-lg font-extrabold leading-tight">
              Please proceed to the service counter now.
            </div>
          </div>
        </div>
      )}

      {/* Main Ticket Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative transition-colors duration-200">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <TicketIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{organization?.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{service?.name}</div>
            </div>
          </div>
          <Badge status={status} size="md" />
        </div>

        {/* Big Ticket Number Area */}
        <div className="p-8 text-center bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Your Virtual Ticket
          </div>
          <div className="text-5xl sm:text-6xl font-black font-mono text-slate-900 dark:text-white tracking-tight mt-2 mb-3">
            {ticket.ticketNumber}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>Customer: <strong>{ticket.customerName}</strong></span>
            <span>•</span>
            <span className="font-mono">{ticket.customerPhone}</span>
          </div>
        </div>

        {/* Ticket Perforated Divider */}
        <div className="relative flex items-center justify-between px-2">
          <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 -ml-4 border-r border-slate-200 dark:border-slate-800" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200 dark:border-slate-800 mx-2" />
          <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 -mr-4 border-l border-slate-200 dark:border-slate-800" />
        </div>

        {/* Status Specific Content */}
        <div className="p-6 space-y-6">
          {status === 'WAITING' && (
            <>
              {/* Queue Position Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    People Ahead of You
                  </div>
                  <div className="text-3xl font-black text-blue-950 dark:text-blue-100 mt-1">
                    {peopleAhead}
                  </div>
                  <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                    {peopleAhead === 0 ? 'You are next in line!' : 'in queue ahead'}
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Estimated Wait
                  </div>
                  <div className="text-3xl font-black text-indigo-950 dark:text-indigo-100 mt-1">
                    {peopleAhead > 0 ? `~${estimatedWaitMinutes}m` : '0m'}
                  </div>
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                    approximate time
                  </div>
                </div>
              </div>

              {/* Real-time Indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live tracking active — keep this page open</span>
              </div>

              {/* Leave Queue CTA */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300"
                  loading={cancelLoading}
                  onClick={handleCancelTicket}
                >
                  Leave Queue / Cancel Ticket
                </Button>
              </div>
            </>
          )}

          {status === 'CALLED' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto animate-live-glow">
                <BellRing className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Number is Called!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                Please proceed directly to the service desk at <strong>{organization?.name}</strong>.
              </p>
            </div>
          )}

          {status === 'SERVING' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Service in Progress</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                You are currently being served at the counter.
              </p>
            </div>
          )}

          {status === 'COMPLETED' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Service Completed</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                Thank you for using QueueLess! Your turn has concluded.
              </p>
              <Link
                to="/customer"
                className="inline-block mt-3 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/60"
              >
                Join Another Queue
              </Link>
            </div>
          )}

          {status === 'CANCELLED' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ticket Cancelled</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                You have left this virtual queue. You can join again anytime.
              </p>
              <Link
                to="/customer"
                className="inline-block mt-3 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/60"
              >
                Browse Queues
              </Link>
            </div>
          )}

          {status === 'NO_SHOW' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Marked as No-Show</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                The operator marked this ticket as absent after calling. Please contact the front desk.
              </p>
            </div>
          )}

          {/* Share / Save link footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined: {new Date(ticket.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Ticket'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
