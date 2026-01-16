import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
    const { registerUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const result = registerUser(formData.fullName, formData.email, formData.password);
            if (result.success) {
                setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                        <span className="text-3xl font-bold text-white">B</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Create Account
                    </h2>
                    <p className="text-gray-600">Join BookNSmash and start playing</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {message.text && (
                        <div
                            className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success'
                                ? 'bg-green-50 text-green-800'
                                : 'bg-red-50 text-red-800'
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

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormInput
                            label="Full Name"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            error={errors.fullName}
                            placeholder="sameer"
                            required
                        />

                        <FormInput
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="you@example.com"
                            required
                        />

                        <FormInput
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="••••••••"
                            required
                        />

                        <FormInput
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                            required
                        />

                        <div>
                            <label className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-semibold">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>
                            {errors.agreeToTerms && (
                                <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                            )}
                        </div>

                        <Button type="submit" variant="primary" className="w-full">
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-primary-600 hover:text-primary-700"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
