import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateEmail = () => {
        if (!email) {
            setError('Email is required');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email is invalid');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateEmail()) {
            // Mock password reset - in production, this would call an API
            setMessage({
                type: 'success',
                text: 'Password reset link has been sent to your email address.'
            });
            setIsSubmitted(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-600">
                        No worries, we'll send you reset instructions
                    </p>
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

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <FormInput
                                label="Email Address"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                error={error}
                                placeholder="you@example.com"
                                required
                            />

                            <Button type="submit" variant="primary" className="w-full">
                                Send Reset Link
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-600 mb-6">
                                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setEmail('');
                                    setMessage({ type: '', text: '' });
                                }}
                            >
                                Send Again
                            </Button>
                        </div>
                    )}

                    <div className="mt-6">
                        <Link
                            to="/login"
                            className="flex items-center justify-center text-sm font-semibold text-primary-600 hover:text-primary-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
