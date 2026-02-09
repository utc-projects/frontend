import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import NotificationManager from './components/NotificationManager';
import MainLayout from './components/MainLayout';
import { ProtectedRoute, AdminRoute, LecturerRoute, StudentRoute, PermissionRoute } from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MapPage from './pages/MapPage';
import UsersPage from './pages/admin/UsersPage';
import PointsPage from './pages/admin/PointsPage';
import RoutesPage from './pages/admin/RoutesPage';
import ProvidersPage from './pages/admin/ProvidersPage';
import PermissionsPage from './pages/admin/PermissionsPage';
import ChangePasswordPage from './pages/admin/ChangePasswordPage';
import RequestApprovalPage from './pages/admin/RequestApprovalPage';
import RequestApprovalDetailPage from './pages/admin/RequestApprovalDetailPage';

import EstimateForm from './pages/estimates/EstimateForm';
import EstimateList from './pages/estimates/EstimateList';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationManager />
        <Router>
          <Routes>
            {/* Public routes - only login/register */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <MainLayout>
                  <UsersPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/permissions" element={
              <AdminRoute>
                <MainLayout>
                  <PermissionsPage />
                </MainLayout>
              </AdminRoute>
            } />



            <Route path="/admin/change-password" element={
              <ProtectedRoute>
                <MainLayout>
                  <ChangePasswordPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/approvals" element={
              <ProtectedRoute>
                <MainLayout>
                  <RequestApprovalPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/approvals/:id" element={
              <ProtectedRoute>
                <MainLayout>
                  <RequestApprovalDetailPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Management Routes - Viewable by all authenticated users if they have permission */}
            <Route path="/admin/points" element={
              <PermissionRoute resource="points" action="view">
                <MainLayout>
                  <PointsPage />
                </MainLayout>
              </PermissionRoute>
            } />
            <Route path="/admin/routes" element={
              <PermissionRoute resource="routes" action="view">
                <MainLayout>
                  <RoutesPage />
                </MainLayout>
              </PermissionRoute>
            } />
            <Route path="/admin/providers" element={
              <PermissionRoute resource="providers" action="view">
                <MainLayout>
                  <ProvidersPage />
                </MainLayout>
              </PermissionRoute>
            } />



            {/* Estimate Routes */}
            <Route path="/estimates" element={
              <ProtectedRoute>
                <MainLayout>
                  <EstimateList />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/estimates/new" element={
              <ProtectedRoute>
                <MainLayout>
                  <EstimateForm />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/estimates/:id/edit" element={
              <ProtectedRoute>
                <MainLayout>
                  <EstimateForm />
                </MainLayout>
              </ProtectedRoute>
            } />



            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
