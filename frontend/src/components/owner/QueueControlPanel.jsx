import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  PhoneCall,
  Play,
  CheckCircle2,
  UserX,
  ToggleLeft,
  ToggleRight,
  User,
  Clock,
  Phone,
  AlertCircle,
} from 'lucide-react';

export const QueueControlPanel = ({
  service,
  queue,
  currentTicket,
  waitingCount,
  onToggleQueue,
  onCallNext,
  onStartServing,
  onComplete,
  onNoShow,
  actionLoading,
}) => {
  const isOpen = queue?.status === 'OPEN';
  const hasActiveCurrent = currentTicket && ['CALLED', 'SERVING'].includes(currentTicket.status);
  const isCalled = currentTicket && currentTicket.status === 'CALLED';
  const isServing = currentTicket && currentTicket.status === 'SERVING';

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & Toggle */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono px-2.5 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-lg">
              {service.ticketPrefix}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{service.name}</h2>
            <Badge status={isOpen ? 'OPEN' : 'CLOSED'} size="lg" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isOpen
              ? 'Queue is OPEN and actively accepting new guest customers.'
              : 'Queue is CLOSED. Existing waiting customers can still be served.'}
          </p>
        </div>

        <Button
          variant={isOpen ? 'danger' : 'success'}
          size="md"
          loading={actionLoading === 'toggleQueue'}
          onClick={onToggleQueue}
          className="shrink-0"
        >
          {isOpen ? (
            <>
              <ToggleRight className="w-4 h-4" />
              <span>Close Queue</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span>Open Queue</span>
            </>
          )}
        </Button>
      </div>

      {/* Active Operational Station Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Active Customer */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Operational Ticket
              </span>
              {currentTicket ? (
                <Badge status={currentTicket.status} size="md" />
              ) : (
                <span className="text-xs text-slate-400 font-medium">Counter Idle</span>
              )}
            </div>

            {currentTicket && ['CALLED', 'SERVING'].includes(currentTicket.status) ? (
              <div className="space-y-4">
                {/* Big Ticket Display */}
                <div className="flex items-center justify-between p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      Ticket Number
                    </div>
                    <div className="text-4xl font-extrabold font-mono text-blue-950 mt-1">
                      {currentTicket.ticketNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Customer</div>
                    <div className="text-base font-bold text-slate-900">
                      {currentTicket.customerName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {currentTicket.customerPhone}
                    </div>
                  </div>
                </div>

                {/* Status Specific Information */}
                {isCalled && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      Customer has been <strong>CALLED</strong>. Waiting for them to step up to the counter.
                    </span>
                  </div>
                )}

                {isServing && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0 text-indigo-600" />
                    <span>
                      Currently <strong>SERVING</strong> customer. Click Complete once finished.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <User className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <div className="text-sm font-semibold text-slate-600">No active customer at counter</div>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Call Next Customer" below to serve the next ticket in line.
                </p>
              </div>
            )}
          </div>

          {/* Action buttons for current ticket */}
          <div className="pt-6 border-t border-slate-100 mt-6 flex flex-wrap items-center gap-3">
            {isCalled && (
              <>
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={actionLoading === 'startServing'}
                  onClick={() => onStartServing(currentTicket._id)}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Serving</span>
                </Button>
                <Button
                  variant="danger"
                  className="px-4"
                  loading={actionLoading === 'markNoShow'}
                  onClick={() => onNoShow(currentTicket._id)}
                >
                  <UserX className="w-4 h-4" />
                  <span>No Show</span>
                </Button>
              </>
            )}

            {isServing && (
              <Button
                variant="success"
                className="w-full py-3 text-base"
                loading={actionLoading === 'complete'}
                onClick={() => onComplete(currentTicket._id)}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Service & Finish</span>
              </Button>
            )}

            {!hasActiveCurrent && (
              <div className="w-full text-center text-xs text-slate-400">
                Ready to call next waiting customer
              </div>
            )}
          </div>
        </div>

        {/* Next in Line / Dispatch Console */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Queue Dispatcher
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {waitingCount} Waiting
              </span>
            </div>

            <div className="space-y-4 my-6">
              <div className="text-center py-4">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Customers in Line
                </div>
                <div className="text-5xl font-black text-white mt-1 tracking-tight">
                  {waitingCount}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Est. remaining queue time: ~{waitingCount * (service.averageServiceTime || 10)} mins
                </div>
              </div>

              {hasActiveCurrent && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-center">
                  ⚠️ Complete or mark current ticket before calling next.
                </div>
              )}
            </div>
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              className="w-full py-4 text-base bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/30 disabled:opacity-40"
              disabled={hasActiveCurrent || waitingCount === 0}
              loading={actionLoading === 'callNext'}
              onClick={onCallNext}
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call Next Customer (FIFO)</span>
            </Button>
            {waitingCount === 0 && (
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Waiting queue is currently empty.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
