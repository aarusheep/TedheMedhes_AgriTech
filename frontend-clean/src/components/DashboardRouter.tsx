import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FarmerDashboard } from '../pages/FarmerDashboard';
import { DistributorDashboard } from '../pages/DistributorDashboard';

export function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'Farmer') {
    return <FarmerDashboard />;
  }

  if (user.role === 'Distributor') {
    return <DistributorDashboard />;
  }

  return <Navigate to="/login" replace />;
}
