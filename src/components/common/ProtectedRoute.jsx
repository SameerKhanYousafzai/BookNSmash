import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * Restricts access to routes based on user role
 * 
 * @param {string} requiredRole - 'USER' | 'ADMIN' | null (any authenticated)
 * @param {ReactNode} children - Components to render if authorized
 */
export default function ProtectedRoute({ requiredRole, children }) {
    const { isAuthenticated, userRole } = useAuth();

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated but wrong role
    if (requiredRole && userRole !== requiredRole) {
        // Admin trying to access user routes - allow
        if (userRole === 'ADMIN') {
            return <>{children}</>;
        }
        // User trying to access admin routes - deny
        return <Navigate to="/unauthorized" replace />;
    }

    // Authorized
    return <>{children}</>;
}
