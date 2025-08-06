'use client'

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

// Toast bileşeni
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void; }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            'bg-red-100 text-red-800 border border-red-200'
            }`}>
            {type === 'success' ?
                <CheckCircle className="h-5 w-5" /> :
                <AlertCircle className="h-5 w-5" />
            }
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-gray-500 hover:text-gray-700"
            >
                ×
            </button>
        </div>
    );
};

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }: { onSwitchToRegister: () => void; onLoginSuccess: (user: any) => void; }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            setLoading(false);
            return;
        }

        // Simulate Supabase auth - replace with actual supabase code
        setTimeout(() => {
            if (email.includes('@')) {
                showToast('Sign in successful! Redirecting...', 'success');
                setTimeout(() => {
                    onLoginSuccess({ email, id: '123' });
                }, 1500);
            } else {
                showToast('Invalid email or password', 'error');
            }
            setLoading(false);
        }, 1000);
    };

    const handleGoogleLogin = () => {
        showToast('Google login integration needed', 'error');
    };

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm mx-auto w-full max-w-[380px]">
                <div className="grid auto-rows-min grid-rows-[auto_auto] gap-1.5 px-6 items-center justify-center">
                    <a href="#" className="flex items-center gap-2 justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tighter">Your App</span>
                    </a>
                </div>
                <div className="px-6">
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border border-gray-300 bg-white shadow-sm hover:bg-gray-50 h-9 px-4 py-2 w-full"
                        >
                            <svg className="mr-2 size-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign up with Google
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="h-px w-full bg-gray-200"></span>
                            <span className="text-xs text-gray-500">OR</span>
                            <span className="h-px w-full bg-gray-200"></span>
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                placeholder="m@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-blue-600 text-white shadow-sm hover:bg-blue-700 h-9 px-4 py-2 w-full"
                        >
                            {loading ? 'Signing in...' : 'Log in'}
                        </button>
                    </form>
                </div>
                <div className="mx-auto flex gap-1 text-sm px-6">
                    <p className="text-gray-600">Don't have an account yet?</p>
                    <button
                        onClick={onSwitchToRegister}
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
                        disabled={loading}
                    >
                        Sign up
                    </button>
                </div>
            </div>
        </>
    );
};

const RegisterForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const validateForm = () => {
        if (!name.trim()) {
            showToast('Please enter your full name', 'error');
            return false;
        }
        if (!email) {
            showToast('Please enter your email address', 'error');
            return false;
        }
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return false;
        }
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return false;
        }
        if (!agreeTerms) {
            showToast('You must accept the terms and conditions', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // Simulate Supabase registration - replace with actual supabase code
        setTimeout(() => {
            showToast('Registration successful! Please check your email.', 'success');
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
            setLoading(false);
        }, 1000);
    };

    const handleGoogleLogin = () => {
        showToast('Google signup integration needed', 'error');
    };

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm mx-auto w-full max-w-[380px]">
                <div className="grid auto-rows-min grid-rows-[auto_auto] gap-1.5 px-6 items-center justify-center">
                    <a href="#" className="flex items-center gap-2 justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tighter">Your App</span>
                    </a>
                </div>
                <div className="px-6">
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border border-gray-300 bg-white shadow-sm hover:bg-gray-50 h-9 px-4 py-2 w-full"
                        >
                            <svg className="mr-2 size-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign up with Google
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="h-px w-full bg-gray-200"></span>
                            <span className="text-xs text-gray-500">OR</span>
                            <span className="h-px w-full bg-gray-200"></span>
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                placeholder="John Doe"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                placeholder="m@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors outline-none placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    placeholder="Confirm your password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                disabled={loading}
                                required
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I accept the terms of service and privacy policy
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-green-600 text-white shadow-sm hover:bg-green-700 h-9 px-4 py-2 w-full"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
                <div className="mx-auto flex gap-1 text-sm px-6">
                    <p className="text-gray-600">Already have an account?</p>
                    <button
                        onClick={onSwitchToLogin}
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
                        disabled={loading}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </>
    );
};

export default function GetStarted() {
    const [currentView, setCurrentView] = useState('login');
    const [user, setUser] = useState<any>(null);
    const [isProcessingCallback, setIsProcessingCallback] = useState(false);

    const handleLoginSuccess = (userData: any) => {
        setUser(userData);
        console.log('Kullanıcı giriş yaptı:', userData);
    };

    // Eğer callback işleniyor ise loading göster
    if (isProcessingCallback) {
        return (
            <section className="py-32 bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm mx-auto w-full max-w-[380px]">
                            <div className="text-center py-8 px-6">
                                <div className="flex justify-center mb-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                                <p className="text-gray-600">Processing authentication...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Eğer kullanıcı giriş yapmışsa, başka bir component göster
    if (user) {
        return (
            <section className="py-32 bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm mx-auto w-full max-w-[380px]">
                            <div className="text-center py-8 px-6">
                                <div className="flex justify-center mb-4">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h2>
                                <p className="text-gray-600">You have successfully signed in.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-32 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center gap-4">
                    {currentView === 'login' ? (
                        <LoginForm
                            onSwitchToRegister={() => setCurrentView('register')}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    ) : (
                        <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
                    )}
                </div>
            </div>
        </section>
    );
}