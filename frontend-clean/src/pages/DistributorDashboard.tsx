import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowseProductsPage } from './BrowseProductsPage';

export function DistributorDashboard() {
  // For distributors, the dashboard is the browse page
  return <BrowseProductsPage />;
}
