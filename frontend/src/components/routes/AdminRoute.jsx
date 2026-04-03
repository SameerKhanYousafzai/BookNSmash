import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Loader2 } from 'lucide-react';

/**
 * AdminRoute Component
 * Ensures only admin users can access admin routes.
 * Uses localStorage as synchronous source of truth to avoid race conditions
 * when navigating immediately after login (React state may not have flushed yet).
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, userRole, logout } = useAuth();
    const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(null);

    // Check both React state AND localStorage to handle race conditions
    const localToken = localStorage.getItem('accessToken');
    const localRole = localStorage.getItem('userRole');
    const hasAuth = isAuthenticated || !!(localToken && localRole);
    const hasAdminRole = userRole === 'ADMIN' || localRole === 'ADMIN';

    useEffect(() => {
        const verifyAdminStatus = async () => {
            if (!hasAuth || !hasAdminRole) {
                setIsVerifiedAdmin(false);
                return;
            }

            try {
                // Fetch fresh profile from backend to guarantee role hasn't been spoofed locally
                const res = await api.get('/users/me');
                const data = await res.json();
                
                if (res.ok && data.user && data.user.role === 'ADMIN') {
                    setIsVerifiedAdmin(true);
                } else {
                    console.error('Server validation failed: User is not an ADMIN');
                    setIsVerifiedAdmin(false);
                    logout();
                }
            } catch (error) {
                console.error('Admin validation check failed:', error);
                setIsVerifiedAdmin(false);
            }
        };

        verifyAdminStatus();
    }, [hasAuth, hasAdminRole]); // eslint-disable-line react-hooks/exhaustive-deps

    // Not authenticated at all — redirect to admin login
    if (!hasAuth) return <Navigate to="/admin/login" replace />;
    
    // While server-side verification is ongoing
    if (isVerifiedAdmin === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="mt-4 text-gray-600 font-medium">Verifying admin credentials...</p>
            </div>
        );
    }

    if (!isVerifiedAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default AdminRoute;
