"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    useEffect(() => {
        // Check if we have valid reset tokens in the URL
        const checkTokens = async () => {
            const accessToken = searchParams.get('access_token');
            const refreshToken = searchParams.get('refresh_token');
            const type = searchParams.get('type');

            if (accessToken && refreshToken && type === 'recovery') {
                try {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });

                    if (error) {
                        setIsValidToken(false);
                        showToast('Invalid or expired reset link', 'error');
                    } else {
                        setIsValidToken(true);
                    }
                } catch (error) {
                    setIsValidToken(false);
                    showToast('An error occurred while validating the reset link', 'error');
                }
            } else {
                setIsValidToken(false);
                showToast('Invalid reset link', 'error');
            }
        };

        checkTokens();
    }, [searchParams]);

    const validateForm = () => {
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return false;
        }
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                showToast('Failed to update password. Please try again.', 'error');
            } else {
                showToast('Password updated successfully! Redirecting to login...', 'success');
                setTimeout(() => {
                    router.push('/getstarted');
                }, 2000);
            }
        } catch (error) {
            showToast('An unexpected error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (isValidToken === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <Card className="w-full max-w-md mx-auto">
                    <CardContent className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Validating reset link...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isValidToken === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Header */}
                <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-6 py-4">
                        <Link href="/getstarted" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                <div className="flex items-center justify-center py-12">
                    <Card className="w-full max-w-md mx-auto bg-red-50 border-red-200">
                        <CardHeader className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                            <CardTitle className="text-2xl font-bold text-red-800">
                                Invalid Reset Link
                            </CardTitle>
                            <CardDescription className="text-red-600">
                                This password reset link is invalid or has expired.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-red-700 mb-6">
                                Please request a new password reset link from the login page.
                            </p>
                            <Link href="/getstarted">
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                                    Go to Login
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/getstarted" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </div>
            </div>

            <div className="flex items-center justify-center py-12">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Reset Password
                        </CardTitle>
                        <CardDescription>
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                        disabled={loading}
                                        required
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

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pr-10"
                                        disabled={loading}
                                        required
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

                            <div className="text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="font-medium mb-1">Password requirements:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>At least 6 characters long</li>
                                    <li>Must match the confirmation password</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating Password...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Remember your password?{' '}
                                <Link href="/getstarted" className="text-purple-600 hover:text-purple-700 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
    );
}