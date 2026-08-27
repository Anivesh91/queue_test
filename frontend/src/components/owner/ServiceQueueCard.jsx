import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Users, Clock, PlayCircle, ToggleLeft, ToggleRight } from 'lucide-react';

export const ServiceQueueCard = ({ item, onToggleQueue, loadingToggle }) => {
  const { service, queue, status, waitingCount, currentTicket, completedToday } = item;
  const isOpen = status === 'OPEN';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Service Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 font-mono text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-900/50">
              {service.ticketPrefix}
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{service.name}</h3>
          </div>
          <Badge status={isOpen ? 'OPEN' : 'CLOSED'} />
        </div>

        {service.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{service.description}</p>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-center mb-4">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Waiting</div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">{waitingCount}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Now Serving</div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5 truncate font-mono">
              {currentTicket ? currentTicket.ticketNumber : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Done Today</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{completedToday || 0}</div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onToggleQueue(service._id, isOpen)}
          disabled={loadingToggle === service._id}
          className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
            isOpen
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
          }`}
        >
          {isOpen ? (
            <>
              <ToggleRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Close Queue</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Open Queue</span>
            </>
          )}
        </button>

        <Link
          to={`/organization/queues/${service._id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-sm transition-all"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Live Console</span>
        </Link>
      </div>
    </div>
  );
};
