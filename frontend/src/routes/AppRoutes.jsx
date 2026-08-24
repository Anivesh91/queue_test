import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { CustomerHomePage } from '../pages/customer/CustomerHomePage';
import { SearchResultsPage } from '../pages/customer/SearchResultsPage';
import { PublicOrgPage } from '../pages/customer/PublicOrgPage';
import { ServiceQueuePage } from '../pages/customer/ServiceQueuePage';
import { TicketTrackerPage } from '../pages/customer/TicketTrackerPage';
import { OrgEntryPage } from '../pages/organization/OrgEntryPage';
import { RegisterPage } from '../pages/organization/RegisterPage';
import { LoginPage } from '../pages/organization/LoginPage';
import { OrgSetupPage } from '../pages/organization/OrgSetupPage';
import { DashboardPage } from '../pages/organization/DashboardPage';
import { ProfilePage } from '../pages/organization/ProfilePage';
import { ServicesPage } from '../pages/organization/ServicesPage';
import { QueueConsolePage } from '../pages/organization/QueueConsolePage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Customer / Guest Routes */}
      <Route path="/customer" element={<CustomerHomePage />} />
      <Route path="/customer/organizations" element={<SearchResultsPage />} />
      <Route path="/customer/organizations/:slug" element={<PublicOrgPage />} />
      <Route path="/customer/services/:serviceId" element={<ServiceQueuePage />} />
      <Route path="/customer/tickets/:publicToken" element={<TicketTrackerPage />} />

      {/* Public Organization Auth Routes */}
      <Route path="/organization" element={<OrgEntryPage />} />
      <Route path="/organization/register" element={<RegisterPage />} />
      <Route path="/organization/login" element={<LoginPage />} />

      {/* Protected Owner Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/organization/setup" element={<OrgSetupPage />} />
        <Route path="/organization/dashboard" element={<DashboardPage />} />
        <Route path="/organization/profile" element={<ProfilePage />} />
        <Route path="/organization/services" element={<ServicesPage />} />
        <Route path="/organization/queues/:serviceId" element={<QueueConsolePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
