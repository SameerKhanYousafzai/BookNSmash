import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages authentication state and provides auth methods to the entire app
 * Uses localStorage to persist authentication across page refreshes
 */
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); // 'USER' | 'ADMIN' | null
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // Check for existing auth on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem('isAuthenticated');
        const storedRole = localStorage.getItem('userRole');
        const storedUser = localStorage.getItem('currentUser');

        if (storedAuth === 'true' && storedRole) {
            setIsAuthenticated(true);
            setUserRole(storedRole);
            setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
        }
    }, []);

    /**
     * User Login
     * Mock authentication - checks against localStorage database
     */
    const loginUser = (email, password) => {
        // Mock validation
        if (email && password) {
            // Get users from DB
            const usersDb = JSON.parse(localStorage.getItem('booknsmash_users_db') || '{}');
            const storedUser = usersDb[email.toLowerCase()];

            const user = {
                id: storedUser?.id || 1,
                name: storedUser?.name || 'User',
                email: email,
                avatar: storedUser?.avatar || 'https://i.pravatar.cc/150?img=12',
            };

            setIsAuthenticated(true);
            setUserRole('USER');
            setCurrentUser(user);

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', 'USER');
            localStorage.setItem('currentUser', JSON.stringify(user));

            navigate('/');
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    /**
     * User Registration
     * Mock registration - saves to localStorage database
     */
    const registerUser = (name, email, password) => {
        // Mock validation
        if (name && email && password) {
            const user = {
                id: Date.now(),
                name: name,
                email: email,
                avatar: 'https://i.pravatar.cc/150?img=12',
            };

            // Save to users DB
            const usersDb = JSON.parse(localStorage.getItem('booknsmash_users_db') || '{}');
            usersDb[email.toLowerCase()] = user;
            localStorage.setItem('booknsmash_users_db', JSON.stringify(usersDb));

            setIsAuthenticated(true);
            setUserRole('USER');
            setCurrentUser(user);

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', 'USER');
            localStorage.setItem('currentUser', JSON.stringify(user));

            navigate('/');
            return { success: true };
        }
        return { success: false, message: 'All fields are required' };
    };

    /**
     * Admin Login
     * Mock admin authentication
     * Default credentials: admin@booknsmash.com / admin123
     */
    const loginAdmin = (email, password) => {
        // Mock admin credentials
        if (email === 'admin@booknsmash.com' && password === 'admin123') {
            const admin = {
                id: 999,
                name: 'Admin',
                email: email,
                role: 'ADMIN',
            };

            setIsAuthenticated(true);
            setUserRole('ADMIN');
            setCurrentUser(admin);

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', 'ADMIN');
            localStorage.setItem('currentUser', JSON.stringify(admin));

            navigate('/admin/dashboard/weekly');
            return { success: true };
        }
        return { success: false, message: 'Invalid admin credentials' };
    };

    /**
     * Logout
     * Clears all authentication data
     */
    const logout = () => {
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
        loginUser,
        registerUser,
        loginAdmin,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
