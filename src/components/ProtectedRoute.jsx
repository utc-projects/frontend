import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ProtectedRoute - requires authentication
export function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// RoleRoute - requires specific role(s)
export function RoleRoute({ children, roles = [] }) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// AdminRoute - requires admin role
export function AdminRoute({ children }) {
    return <RoleRoute roles={['admin']}>{children}</RoleRoute>;
}

// LecturerRoute - requires lecturer or admin role
export function LecturerRoute({ children }) {
    return <RoleRoute roles={['lecturer', 'admin']}>{children}</RoleRoute>;
}

// StudentRoute - requires student role
export function StudentRoute({ children }) {
    return <RoleRoute roles={['student']}>{children}</RoleRoute>;
}

// PermissionRoute - requires specific resource/action permission
export function PermissionRoute({ children, resource, action = 'view' }) {
    const { checkPermission, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!checkPermission(resource, action)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
