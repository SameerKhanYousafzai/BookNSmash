import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const { handleOAuthSync } = useAuth();
    const [status, setStatus] = useState('Authenticating with provider...');

    useEffect(() => {
        const processOAuth = async () => {
            try {
                // Supabase automatically parses the URL hash containing the access token
                // We just need to ask it for the current session.
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setStatus('Authentication failed. Redirecting to login...');
                    setTimeout(() => navigate('/login'), 2000);
                    return;
                }

                if (!session) {
                    // It might take a split second for the session to be available, or the URL didn't contain auth info
                    setStatus('No session found. Redirecting to login...');
                    setTimeout(() => navigate('/login'), 2000);
                    return;
                }

                setStatus('Syncing with BookNSmash servers...');
                
                // Get the user data from Supabase
                const user = session.user;
                const email = user.email;
                const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
                const provider = user.app_metadata?.provider || 'oauth';

                // Call the backend to create/sync the user and get our custom JWTs
                const syncResult = await handleOAuthSync(email, name, provider, user.id);
                
                if (syncResult.success) {
                    setStatus('Success! Redirecting...');
                } else {
                    setStatus(syncResult.message || 'Sync failed. Redirecting...');
                    setTimeout(() => navigate('/login'), 3000);
                }

            } catch (error) {
                console.error('Unexpected OAuth callback error:', error);
                setStatus('An unexpected error occurred. Redirecting...');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        processOAuth();
    }, [navigate, handleOAuthSync]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-4 border border-gray-100 dark:border-gray-700">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure Login</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{status}</p>
            </div>
        </div>
    );
}
