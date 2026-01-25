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
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none dark:text-white placeholder:text-gray-400"
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
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none dark:text-white placeholder:text-gray-400"
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
                                className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all outline-none dark:text-white placeholder:text-gray-400"
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

                {/* OAuth Buttons  */}
                <div className="space-y-3">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white dark:bg-black text-gray-500 font-bold uppercase tracking-wider">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = `${window.location.origin}/api/auth/google`;
                            }}
                            className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = `${window.location.origin}/api/auth/github`;
                            }}
                            className="flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
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
