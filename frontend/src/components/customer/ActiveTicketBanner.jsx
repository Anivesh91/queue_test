import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../../api/ticketApi';
import { useSocket } from '../../context/SocketContext';
import { Ticket, ArrowRight, X } from 'lucide-react';

export const ActiveTicketBanner = () => {
  const { socket } = useSocket();
  const [activeTicket, setActiveTicket] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const purgeTicketFromStorage = (publicToken) => {
    try {
      const saved = JSON.parse(localStorage.getItem('queueless_active_tickets') || '[]');
      const updated = saved.filter((t) => t.publicToken !== publicToken);
      localStorage.setItem('queueless_active_tickets', JSON.stringify(updated));
    } catch (e) {}
    setActiveTicket(null);
  };

  const verifyAndLoadActiveTicket = async () => {
    try {
      const saved = JSON.parse(localStorage.getItem('queueless_active_tickets') || '[]');
      if (!Array.isArray(saved) || saved.length === 0) {
        setActiveTicket(null);
        return;
      }

      const candidate = saved.find(
        (t) => t.status !== 'CANCELLED' && t.status !== 'COMPLETED' && t.status !== 'NO_SHOW'
      );

      if (!candidate || !candidate.publicToken) {
        setActiveTicket(null);
        return;
      }

      // Live server check: verify ticket exists and is still active in DB
      try {
        const res = await ticketApi.track(candidate.publicToken);
        const data = res?.data;
        const liveTicket = data?.ticket;

        if (liveTicket && ['WAITING', 'CALLED', 'SERVING'].includes(liveTicket.status)) {
          setActiveTicket({
            publicToken: liveTicket.publicToken,
            ticketNumber: liveTicket.ticketNumber,
            serviceName: data.service?.name || candidate.serviceName,
            organizationName: data.organization?.name || candidate.organizationName,
            status: liveTicket.status,
          });
        } else {
          // If ticket has concluded (completed/cancelled/no-show), purge from storage
          purgeTicketFromStorage(candidate.publicToken);
        }
      } catch (err) {
        // If ticket not found in DB (404/deleted), auto-purge from localStorage immediately!
        purgeTicketFromStorage(candidate.publicToken);
      }
    } catch (e) {
      console.warn('ActiveTicketBanner verification error:', e);
    }
  };

  useEffect(() => {
    verifyAndLoadActiveTicket();
  }, []);

  // Listen to real-time events to auto-dismiss if ticket is completed/cancelled
  useEffect(() => {
    if (!socket || !activeTicket) return;

    const handleTicketEnd = (payload) => {
      if (payload?.ticketNumber === activeTicket.ticketNumber) {
        purgeTicketFromStorage(activeTicket.publicToken);
      }
    };

    socket.on('ticket:completed', handleTicketEnd);
    socket.on('ticket:cancelled', handleTicketEnd);
    socket.on('ticket:noShow', handleTicketEnd);

    return () => {
      socket.off('ticket:completed', handleTicketEnd);
      socket.off('ticket:cancelled', handleTicketEnd);
      socket.off('ticket:noShow', handleTicketEnd);
    };
  }, [socket, activeTicket]);

  if (!activeTicket || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 py-2.5 shadow-md relative z-40 animate-in slide-in-from-top duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-blue-100 uppercase tracking-wider text-[10px]">
              Active Ticket:
            </span>
            <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded-md text-white">
              {activeTicket.ticketNumber}
            </span>
            {activeTicket.organizationName && (
              <span className="text-blue-100">
                at <strong>{activeTicket.organizationName}</strong>
              </span>
            )}
            {activeTicket.serviceName && (
              <span className="text-blue-200 hidden md:inline">
                ({activeTicket.serviceName})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/customer/tickets/${activeTicket.publicToken}`}
            className="inline-flex items-center gap-1 bg-white text-blue-700 font-bold px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors shadow-xs"
          >
            <span>Resume Live Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              setDismissed(true);
            }}
            className="text-blue-200 hover:text-white p-0.5 rounded-md focus:outline-none cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
