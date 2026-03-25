import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin Login Page
 * Redesigned to match AdminLayout's design system:
 *   - Indigo-to-purple gradient accents (same as sidebar active state)
 *   - Gray-800 card on gray-900 background
 *   - Rounded-xl borders, generous spacing
 *   - No orange/yellow — pure indigo/purple palette
 */
export default function AdminLogin() {
    const { loginAdmin, loading } = useAuth();
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            const result = await loginAdmin(formData.email, formData.password);
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
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header — matches AdminLayout logo treatment */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/25">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
                        Admin Portal
                    </h2>
                    <p className="text-sm text-gray-400">
                        Secure access for administrators only
                    </p>
                </div>

                {/* Form Card — same surface as sidebar */}
                <div className="bg-gray-800 rounded-xl p-7 border border-gray-700/80 shadow-xl">
                    {message.text && (
                        <div
                            className={`mb-5 p-3.5 rounded-lg flex items-start gap-2.5 text-sm font-medium ${
                                message.type === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                        >
                            {message.type === 'success' ? (
                                <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@booknsmash.com"
                                className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-600/50 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-200"
                                required
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-600/50 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all duration-200"
                                required
                            />
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Button — matches sidebar active gradient */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In as Admin'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials — subtle, matches sidebar footer card */}
                    <div className="mt-6 pt-5 border-t border-gray-700/60">
                        <div className="bg-gray-900/50 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Demo Credentials
                            </p>
                            <p className="text-xs text-gray-500">
                                Email: <span className="text-gray-400">admin@booknsmash.com</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                Password: <span className="text-gray-400">admin123</span>
                            </p>
                        </div>
                    </div>

                    {/* User Login Link */}
                    <div className="mt-5 text-center">
                        <p className="text-sm text-gray-500">
                            Not an admin?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
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
