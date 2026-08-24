import React from 'react';
import { Users, Clock, Phone, User, Hash } from 'lucide-react';
import { Badge } from '../common/Badge';

export const WaitingCustomerList = ({ waitingTickets, avgServiceTime = 10 }) => {
  if (!waitingTickets || waitingTickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-700">No Customers Waiting</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          When customers join this service queue remotely, their live virtual tickets will appear here in exact FIFO order.
        </p>
      </div>
    );
  }

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Waiting Queue ({waitingTickets.length})
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">FIFO Order</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Ticket</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Joined Time</th>
              <th className="px-6 py-3">Est. Wait</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {waitingTickets.map((t, index) => {
              const estWait = index * avgServiceTime;
              return (
                <tr
                  key={t._id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    index === 0 ? 'bg-blue-50/30 font-medium' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {t.ticketNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {t.customerName}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {t.customerPhone}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatTime(t.joinedAt)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {index === 0 ? (
                      <span className="text-emerald-600 font-bold">Next in line</span>
                    ) : (
                      `~${estWait} min`
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={t.status} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
