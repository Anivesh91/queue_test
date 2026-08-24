import React from 'react';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ServiceCard = ({ service, onJoinClick }) => {
  const queue = service.queue || { status: 'CLOSED' };
  const isOpen = queue.status === 'OPEN';
  const waitingCount = service.waitingCount || 0;
  const avgTime = service.averageServiceTime || 10;
  const estimatedWait = waitingCount * avgTime;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
              {service.ticketPrefix}
            </span>
            <h4 className="text-base font-bold text-slate-900">{service.name}</h4>
          </div>
          <Badge status={isOpen ? 'OPEN' : 'CLOSED'} />
        </div>

        {service.description && (
          <p className="text-xs text-slate-600 mb-4 line-clamp-2">{service.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">WAITING</div>
              <div className="font-bold text-slate-800">{waitingCount} people</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">EST. WAIT</div>
              <div className="font-bold text-slate-800">
                {waitingCount > 0 ? `~${estimatedWait} min` : 'No wait'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        {isOpen ? (
          <Button
            variant="primary"
            className="w-full justify-between"
            onClick={() => onJoinClick(service)}
          >
            <span>Join This Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="secondary" disabled className="w-full opacity-60">
            Queue Currently Closed
          </Button>
        )}
      </div>
    </div>
  );
};
