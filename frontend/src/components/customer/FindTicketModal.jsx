import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ticketApi } from '../../api/ticketApi';
import { Phone, Search, AlertCircle, Ticket, Building2, ArrowRight, Clock } from 'lucide-react';

export const FindTicketModal = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() || phone.trim().length < 4) {
      setError('Please enter at least 4 digits of your phone number.');
      return;
    }

    try {
      setLoading(true);
      const res = await ticketApi.lookup(phone.trim());
      setTickets(res?.data?.tickets || []);
    } catch (err) {
      setError(err.message || 'Failed to lookup tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTickets(null);
    setPhone('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Find My Active Ticket">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Accidentally closed your tab? Enter your phone number to restore and track your live spot in line.
        </p>

        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
            <Search className="w-4 h-4 mr-1.5" />
            <span>Search Active Tickets</span>
          </Button>
        </form>

        {/* Results */}
        {tickets !== null && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {tickets.length > 0 ? `Found ${tickets.length} Active Ticket(s)` : 'No Active Tickets Found'}
            </h4>

            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                There are no waiting or called tickets registered under this phone number.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                          {t.ticketNumber}
                        </span>
                        <Badge status={t.status} size="sm" />
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                        {t.organization?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {t.service?.name} • {t.peopleAhead} people ahead
                      </div>
                    </div>

                    <Link
                      to={`/customer/tickets/${t.publicToken}`}
                      onClick={handleClose}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
