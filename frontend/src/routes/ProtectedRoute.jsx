import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12">
        <LoadingSkeleton lines={4} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/organization/login" replace />;
  }

  return <Outlet />;
};
