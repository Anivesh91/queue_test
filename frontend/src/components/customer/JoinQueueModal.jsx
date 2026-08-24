import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { queueApi } from '../../api/queueApi';
import { User, Phone, AlertCircle, Ticket, Clock } from 'lucide-react';

export const JoinQueueModal = ({ isOpen, onClose, service }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!service) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 7) {
      setError('Please enter a valid phone number (minimum 7 digits).');
      return;
    }

    try {
      setLoading(true);
      const res = await queueApi.join(service._id, {
        name: name.trim(),
        phone: phone.trim(),
      });

      const publicToken = res?.data?.publicToken || res?.data?.ticket?.publicToken;
      if (publicToken) {
        onClose();
        navigate(`/customer/tickets/${publicToken}`);
      } else {
        throw new Error('Could not retrieve ticket token. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to join queue. Please check service status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Virtual Queue">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Highlight */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Selected Service
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {service.name}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 mt-1.5 font-medium">
            <span className="flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-blue-600" />
              Prefix: <strong className="font-mono">{service.ticketPrefix}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Avg time: ~{service.averageServiceTime || 10}m
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Your Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aman Sharma"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Customer Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mobile Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            No account required. Used to secure your ticket and prevent duplicate turns.
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Get Virtual Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
