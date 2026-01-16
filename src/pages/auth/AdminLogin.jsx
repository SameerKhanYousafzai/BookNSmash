import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin Login Page
 * Separate login for admin users
 * Default credentials: admin@booknsmash.com / admin123
 */
export default function AdminLogin() {
    const { loginAdmin } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const result = loginAdmin(formData.email, formData.password);
            if (result.success) {
                setMessage({ type: 'success', text: 'Admin login successful! Redirecting...' });
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">
                        Admin Portal
                    </h2>
                    <p className="text-gray-400">Secure access for administrators only</p>
                </div>

                {/* Form */}
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                    {message.text && (
                        <div
                            className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success'
                                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                                    : 'bg-red-900/50 text-red-300 border border-red-700'
                                }`}
                        >
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            )}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@booknsmash.com"
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                required
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                required
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
                        >
                            Sign In as Admin
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                            <p className="text-xs text-gray-400 mb-2">
                                <strong className="text-gray-300">Demo Credentials:</strong>
                            </p>
                            <p className="text-xs text-gray-400">Email: admin@booknsmash.com</p>
                            <p className="text-xs text-gray-400">Password: admin123</p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Not an admin?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-yellow-500 hover:text-yellow-400"
                            >
                                User Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
