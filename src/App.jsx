import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
      <Router>
        <Routes>
          {/* Public routes - only login/register */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes - require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
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
              <UsersPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/permissions" element={
            <AdminRoute>
              <PermissionsPage />
            </AdminRoute>
          } />



          <Route path="/admin/change-password" element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/approvals" element={
            <ProtectedRoute>
              <RequestApprovalPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/approvals/:id" element={
            <ProtectedRoute>
              <RequestApprovalDetailPage />
            </ProtectedRoute>
          } />

          {/* Management Routes - Viewable by all authenticated users if they have permission */}
          <Route path="/admin/points" element={
            <PermissionRoute resource="points" action="view">
              <PointsPage />
            </PermissionRoute>
          } />
          <Route path="/admin/routes" element={
            <PermissionRoute resource="routes" action="view">
              <RoutesPage />
            </PermissionRoute>
          } />
          <Route path="/admin/providers" element={
            <PermissionRoute resource="providers" action="view">
              <ProvidersPage />
            </PermissionRoute>
          } />



          {/* Estimate Routes */}
          <Route path="/estimates" element={
            <ProtectedRoute>
              <EstimateList />
            </ProtectedRoute>
          } />
          <Route path="/estimates/new" element={
            <ProtectedRoute>
              <EstimateForm />
            </ProtectedRoute>
          } />
          <Route path="/estimates/:id/edit" element={
            <ProtectedRoute>
              <EstimateForm />
            </ProtectedRoute>
          } />

          {/* Estimate Routes */}
          <Route path="/estimates" element={
            <ProtectedRoute>
              <EstimateList />
            </ProtectedRoute>
          } />
          <Route path="/estimates/new" element={
            <ProtectedRoute>
              <EstimateForm />
            </ProtectedRoute>
          } />
          <Route path="/estimates/:id/edit" element={
            <ProtectedRoute>
              <EstimateForm />
            </ProtectedRoute>
          } />

          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
