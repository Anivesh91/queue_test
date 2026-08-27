import React from 'react';
import { Users, Clock, Phone, User, Hash } from 'lucide-react';
import { Badge } from '../common/Badge';

export const WaitingCustomerList = ({ waitingTickets, avgServiceTime = 10 }) => {
  if (!waitingTickets || waitingTickets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center transition-colors duration-200">
        <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">No Customers Waiting</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Waiting Queue ({waitingTickets.length})
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">FIFO Order</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {waitingTickets.map((t, index) => {
              const estWait = index * avgServiceTime;
              return (
                <tr
                  key={t._id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                    index === 0 ? 'bg-blue-50/30 dark:bg-blue-950/20 font-medium' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {t.ticketNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                    {t.customerName}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">
                    {t.customerPhone}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {formatTime(t.joinedAt)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {index === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Next in line</span>
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
