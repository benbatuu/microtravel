/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';


// Toast bileşeni (success/error mesajları gri tonlarda)
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void; }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 
            ${type === 'success'
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700'
            }`}>
            {type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            ) : (
                <AlertCircle className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            )}
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
};


const LoginForm = ({
    onSwitchToRegister,
    onLoginSuccess
}: {
    onSwitchToRegister: () => void;
    onLoginSuccess: (user: any) => void;
}) => {
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
            <div className=" w-full max-w-3xl bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col gap-6 rounded-xl border border-gray-300 dark:border-gray-700 py-6 shadow-sm mx-auto">
                <div className="grid auto-rows-min grid-rows-[auto_auto] gap-1.5 px-6 items-center justify-center">
                    <a href="#" className="flex items-center gap-2 justify-center" aria-label="Your App Home">
                        <div className="w-8 h-8 bg-gray-800 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-100 dark:text-gray-800 font-bold text-sm select-none">S</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tighter select-none">Your App</span>
                    </a>
                </div>
                <div className="px-6 max-w-3xl w-full mx-auto">
                    <form onSubmit={handleSubmit} className="grid gap-4 w-full max-w-3xl">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-gray-600 border border-gray-400 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 h-9 px-4 py-2 w-full"
                        >
                            <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="flex items-center gap-4" aria-hidden="true">
                            <span className="h-px w-full bg-gray-300 dark:bg-gray-700"></span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">OR</span>
                            <span className="h-px w-full bg-gray-300 dark:bg-gray-700"></span>
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none dark:text-gray-300" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-9 w-full max-w-3xl rounded-md border border-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 text-base shadow-sm transition-colors outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-600/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-900 dark:text-gray-100"
                                placeholder="m@example.com"
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none dark:text-gray-300" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-9 w-full min-w-0 rounded-md border border-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 pr-10 text-base shadow-sm transition-colors outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-600/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-900 dark:text-gray-100"
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    disabled={loading}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-gray-800 dark:bg-gray-100 text-gray-100 dark:text-gray-900 shadow-sm hover:bg-gray-700 dark:hover:bg-gray-200 h-9 px-4 py-2 w-full"
                        >
                            {loading ? 'Signing in...' : 'Log in'}
                        </button>
                    </form>
                </div>
                <div className="mx-auto flex gap-1 text-sm px-6">
                    <p className="text-gray-600 dark:text-gray-400 select-none">Don’t have an account yet?</p>
                    <button
                        onClick={onSwitchToRegister}
                        className="text-gray-800 dark:text-gray-200 hover:underline font-medium"
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
            <div className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col gap-6 rounded-xl border border-gray-300 dark:border-gray-700 py-6 shadow-sm mx-auto w-full max-w-3xl">
                <div className="grid auto-rows-min grid-rows-[auto_auto] gap-1.5 px-6 items-center justify-center">
                    <a href="#" className="flex items-center gap-2 justify-center" aria-label="Your App Home">
                        <div className="w-8 h-8 bg-gray-800 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-100 dark:text-gray-800 font-bold text-sm select-none">S</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tighter select-none">Your App</span>
                    </a>
                </div>
                <div className="px-6">
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-gray-600 border border-gray-400 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 h-9 px-4 py-2 w-full"
                        >
                            <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign up with Google
                        </button>

                        <div className="flex items-center gap-4" aria-hidden="true">
                            <span className="h-px w-full bg-gray-300 dark:bg-gray-700"></span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">OR</span>
                            <span className="h-px w-full bg-gray-300 dark:bg-gray-700"></span>
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none dark:text-gray-300" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex h-9 w-full min-w-0 rounded-md border border-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 text-base shadow-sm transition-colors outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-600/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-900 dark:text-gray-100"
                                placeholder="John Doe"
                                required
                                disabled={loading}
                                autoComplete="name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none dark:text-gray-300" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-9 w-full min-w-0 rounded-md border border-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 text-base shadow-sm transition-colors outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-600/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-900 dark:text-gray-100"
                                placeholder="m@example.com"
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none dark:text-gray-300" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-9 w-full min-w-0 rounded-md border border-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 pr-10 text-base shadow-sm transition-colors outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-600/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-900 dark:text-gray-100"
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    disabled={loading}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none dark:text-gray-300" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="flex h-9 w-full min-w-0 rounded-md border border-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 pr-10 text-base shadow-sm transition-colors outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:border-gray-600 focus-visible:ring-2 focus-visible:ring-gray-600/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-gray-900 dark:text-gray-100"
                                    placeholder="Confirm your password"
                                    required
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    disabled={loading}
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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
                                className="h-4 w-4 rounded border-gray-400 text-gray-800 focus:ring-gray-600 dark:focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loading}
                                required
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 select-none">
                                I accept the terms of service and privacy policy
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-gray-800 dark:bg-gray-100 text-gray-100 dark:text-gray-900 shadow-sm hover:bg-gray-700 dark:hover:bg-gray-200 h-9 px-4 py-2 w-full"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
                <div className="mx-auto flex gap-1 text-sm px-6">
                    <p className="text-gray-600 dark:text-gray-400 select-none">Already have an account?</p>
                    <button
                        onClick={onSwitchToLogin}
                        className="text-gray-800 dark:text-gray-200 hover:underline font-medium"
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
    const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
    const [user, setUser] = useState<any>(null);
    const [isProcessingCallback] = useState(false);
    const handleLoginSuccess = (userData: any) => {
        setUser(userData);
        console.log('Kullanıcı giriş yaptı:', userData);
    };

    // Eğer callback işleniyor ise loading göster
    if (isProcessingCallback) {
        return (
            <div>
                <section className="py-32 bg-gray-50 dark:bg-blackmin-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">
                    <div className="bg-white dark:bg-gray-800 flex flex-col gap-6 rounded-xl border border-gray-300 dark:border-gray-700 py-6 shadow-sm w-full max-w-3xl text-center px-6">
                        <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 dark:border-gray-100 mx-auto"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Processing authentication...</p>
                    </div>
                </section>
            </div>
        );
    }

    // Eğer kullanıcı giriş yapmışsa, başka bir component göster
    if (user) {
        return (
            <div>
                <section className="py-32 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">
                    <div className="bg-white dark:bg-gray-800 flex flex-col gap-6 rounded-xl border border-gray-300 dark:border-gray-700 py-6 shadow-sm w-full max-w-3xl text-center px-6">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-12 w-12 text-gray-800 dark:text-gray-100 mx-auto" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
                        <p>You have successfully signed in.</p>

                        <button
                            type="button"
                            onClick={() => setUser(null)}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-gray-800 dark:bg-gray-100 text-gray-100 dark:text-gray-900 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-700 dark:hover:bg-gray-200 transition"
                        >
                            Log out
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div>
            <section className="w-full max-w-7xl mx-auto py-32 bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 flex flex-col items-center px-4">
                <div className="flex flex-col items-center gap-4 w-full max-w-xl">
                    {currentView === 'login' ? (
                        <LoginForm
                            onSwitchToRegister={() => setCurrentView('register')}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    ) : (
                        <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
                    )}
                </div>
            </section>
        </div>
    );
}
