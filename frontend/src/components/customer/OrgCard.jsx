import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Layers, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

export const OrgCard = ({ organization }) => {
  const categoryLabels = {
    HOSPITAL_CLINIC: 'Hospital & Clinic',
    SALON_BARBER: 'Salon & Barber',
    DIAGNOSTIC_CENTER: 'Diagnostic Center',
    REPAIR_SERVICE_CENTER: 'Repair Center',
    CONSULTATION_CENTER: 'Consultation',
    OTHER: 'General',
  };

  const openQueues = organization.openQueuesCount || 0;
  const totalServices = organization.servicesCount || (organization.services ? organization.services.length : 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header with Category Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-[11px] font-semibold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase">
            {categoryLabels[organization.category] || organization.category}
          </span>
          {openQueues > 0 ? (
            <Badge status="OPEN" text={`${openQueues} Open`} size="sm" />
          ) : (
            <Badge status="CLOSED" text="Closed" size="sm" />
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
          {organization.name}
        </h3>

        {/* Description */}
        {organization.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {organization.description}
          </p>
        )}

        {/* City & Address */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-5">
          {organization.city && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{organization.city}</span>
              {organization.address && <span>• {organization.address}</span>}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{totalServices} {totalServices === 1 ? 'service' : 'services'} available</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <Link
        to={`/customer/organizations/${organization.slug}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-150"
      >
        <span>View Services & Queues</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
