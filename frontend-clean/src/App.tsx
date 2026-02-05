import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { DashboardRouter } from './components/DashboardRouter';
import { SellingProductsPage } from '@/pages/SellingProductsPage';

// Auth Pages
import { LoginPage } from './pages/LoginPage';

// Farmer Pages
import { CreatePostPage } from './pages/CreatePostPage';
import { NotificationsPage } from './pages/NotificationsPage';

// Distributor Pages
import { BrowseProductsPage } from './pages/BrowseProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { TransactionPage } from './pages/TransactionPage';
import { OwnedProductsPage } from './pages/OwnedProductsPage';
import { RepostPage } from './pages/RepostPage';

// Shared Pages
import { TimelinePage } from './pages/TimelinePage';
import { QRCodePage } from './pages/QRCodePage';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/timeline/:postId" element={<TimelinePage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRouter />} />

              <Route
                path="create-post"
                element={
                  <ProtectedRoute allowedRoles={['Farmer']}>
                    <CreatePostPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="notifications"
                element={
                  <ProtectedRoute allowedRoles={['Farmer']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="qr/:postId" element={<QRCodePage />} />

              <Route
                path="browse"
                element={
                  <ProtectedRoute allowedRoles={['Distributor']}>
                    <BrowseProductsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="product/:id"
                element={
                  <ProtectedRoute allowedRoles={['Distributor']}>
                    <ProductDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="transaction/:postId"
                element={
                  <ProtectedRoute allowedRoles={['Distributor']}>
                    <TransactionPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="owned-products"
                element={
                  <ProtectedRoute allowedRoles={['Distributor']}>
                    <OwnedProductsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="repost/:postId"
                element={
                  <ProtectedRoute allowedRoles={['Distributor']}>
                    <RepostPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="order-history"
                element={
                  <ProtectedRoute allowedRoles={['Distributor']}>
                    <OwnedProductsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="selling-products"
                element={
                  <ProtectedRoute allowedRoles={['Distributor']}>
                    <SellingProductsPage />
                  </ProtectedRoute>
                }
              />

            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </Router>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
