import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

/**
 * Unauthorized Access Page
 * Shown when a user tries to access admin routes without proper permissions
 */
export default function Unauthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
                        Access Denied
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-gray-500">
                        This area is restricted to administrators only.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
                    <Link to="/">
                        <Button variant="primary" className="w-full">
                            <Home className="w-5 h-5 mr-2" />
                            Go to Homepage
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="ghost" className="w-full">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Login
                        </Button>
                    </Link>
                </div>

                <p className="mt-6 text-sm text-gray-500">
                    If you believe this is an error, please contact support.
                </p>
            </div>
        </div>
    );
}
