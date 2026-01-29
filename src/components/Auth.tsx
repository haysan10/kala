import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from './ui/Toast';

interface AuthProps {
    onAuthSuccess: () => void;
    onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!email.trim()) {
            toast.warning('Email Required', 'Please enter your email address.');
            return;
        }
        if (!password.trim()) {
            toast.warning('Password Required', 'Please enter your password.');
            return;
        }
        if (!isLogin && !name.trim()) {
            toast.warning('Name Required', 'Please enter your full name.');
            return;
        }
        if (password.length < 6) {
            toast.warning('Weak Password', 'Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await authService.login({ email, password });
                toast.success('Welcome Back!', 'You have been signed in successfully.');
            } else {
                await authService.register({ email, password, name });
                toast.success('Account Created!', 'Your academic profile has been initialized.');
            }
            onAuthSuccess();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Authentication failed';
            setError(errorMessage);

            // Show specific error toasts based on error type
            if (errorMessage.toLowerCase().includes('email')) {
                toast.error('Invalid Email', errorMessage);
            } else if (errorMessage.toLowerCase().includes('password')) {
                toast.error('Password Error', errorMessage);
            } else if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate')) {
                toast.error('Account Exists', 'An account with this email already exists. Please sign in instead.');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                toast.error('Account Not Found', 'No account found with this email. Please register first.');
            } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
                toast.error('Connection Error', 'Unable to connect to server. Please check your internet connection.');
            } else {
                toast.error('Authentication Failed', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-6 transition-colors duration-1000">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-2">
                    <div
                        className="inline-flex items-center justify-center w-12 h-12 bg-black dark:bg-white rounded-xl mb-4 cursor-pointer"
                        onClick={onBack}
                    >
                        <span className="text-white dark:text-black font-black text-xl">K</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-black dark:text-white uppercase">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {isLogin ? 'Enter your credentials to access your projects' : 'Join the elite academic operating system'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                            <AlertCircle size={18} className="text-red-500" />
                            <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {!isLogin && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none text-black dark:text-white placeholder:text-gray-400"
                                    placeholder="Full Name"
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none text-black dark:text-white placeholder:text-gray-400"
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none text-black dark:text-white placeholder:text-gray-400"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-[0.2em] rounded-2xl text-white bg-black dark:bg-white dark:text-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Initialize Profile'}
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="space-y-3">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100 dark:border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-black px-2 text-gray-400 font-bold tracking-wider">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/api/auth/google'}
                            disabled={loading}
                            className="flex items-center justify-center py-3 px-4 border border-gray-100 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        >
                            <svg className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Google</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => window.location.href = '/api/auth/github'}
                            disabled={loading}
                            className="flex items-center justify-center py-3 px-4 border border-gray-100 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                        >
                            <svg className="h-5 w-5 mr-2 text-black dark:text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">GitHub</span>
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                        {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
