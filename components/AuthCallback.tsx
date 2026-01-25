import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            // Handle OAuth error
            console.error('OAuth Error:', error);
            alert(`Authentication failed: ${error}`);
            navigate('/auth');
            return;
        }

        if (token) {
            // Save token to localStorage
            localStorage.setItem('token', token);

            // Redirect to dashboard
            window.location.href = '/';
        } else {
            // No token or error, redirect to auth
            navigate('/auth');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-black dark:text-white" />
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Completing authentication...
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;
