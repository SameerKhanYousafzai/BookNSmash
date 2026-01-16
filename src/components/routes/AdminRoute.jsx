import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminRoute Component
 * Ensures only admin users can access admin routes
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if authenticated but not admin
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (userRole !== 'ADMIN') {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default AdminRoute;
