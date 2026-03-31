import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages authentication state and provides auth methods to the entire app.
 * All auth operations call the backend API via the api service (with retry logic).
 */
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check for existing auth on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedRole = localStorage.getItem('userRole');
        const storedUser = localStorage.getItem('currentUser');

        if (token && storedRole) {
            setIsAuthenticated(true);
            setUserRole(storedRole);
            setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
        }
    }, []);

    /**
     * Helper: persist auth state to localStorage (UI cache only, secure auth is in HTTP-only cookies)
     */
    const persistAuth = (user, role) => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('currentUser', JSON.stringify(user));
    };

    /**
     * User Login — calls POST /api/auth/login
     */
    const loginUser = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, message: data.message || 'Login failed' };
            }

            setIsAuthenticated(true);
            setUserRole(data.user.role || 'USER');
            setCurrentUser(data.user);
            persistAuth(data.user, data.user.role || 'USER');

            navigate('/');
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || 'Network error. Is the backend running?' };
        } finally {
            setLoading(false);
        }
    };

    /**
     * User Registration — calls POST /api/auth/register
     */
    const registerUser = async (name, email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, message: data.message || 'Registration failed' };
            }

            setIsAuthenticated(true);
            setUserRole('USER');
            setCurrentUser(data.user);
            persistAuth(data.user, 'USER');

            navigate('/');
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message || 'Network error. Is the backend running?' };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Admin Login — calls POST /api/auth/admin/login
     */
    const loginAdmin = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/admin/login', { email, password });
            const data = await res.json();

            if (!res.ok) {
                return { success: false, message: data.message || 'Invalid admin credentials' };
            }

            setIsAuthenticated(true);
            setUserRole('ADMIN');
            setCurrentUser(data.user);
            persistAuth(data.user, 'ADMIN');

            navigate('/admin/dashboard/weekly');
            return { success: true };
        } catch (error) {
            console.error('Admin login error:', error);
            return { success: false, message: error.message || 'Network error. Is the backend running?' };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout — clears all authentication data
     */
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Logout failed:', e);
        }
        setIsAuthenticated(false);
        setUserRole(null);
        setCurrentUser(null);

        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentUser');

        navigate('/login');
    };

    const value = {
        isAuthenticated,
        userRole,
        currentUser,
        loading,
        loginUser,
        registerUser,
        loginAdmin,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
