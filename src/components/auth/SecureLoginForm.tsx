"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { InputSanitizer, CSRFProtection, AuditLogger, DeviceFingerprint } from '@/lib/security';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';

interface SecureLoginFormProps {
    onSuccess?: () => void;
    onSwitchToSignup?: () => void;
    onForgotPassword?: () => void;
}

export function SecureLoginForm({
    onSuccess,
    onSwitchToSignup,
    onForgotPassword
}: SecureLoginFormProps) {
    const { signIn } = useAuth();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [formState, setFormState] = useState({
        isLoading: false,
        showPassword: false,
        error: '',
        rateLimited: false,
        remainingAttempts: 5,
    });

    const [csrfToken, setCsrfToken] = useState<string>('');

    // Initialize CSRF protection
    useEffect(() => {
        const token = CSRFProtection.generateToken();
        CSRFProtection.setToken(token);
        setCsrfToken(token);
    }, []);

    // Check rate limit status on mount
    useEffect(() => {
        const checkRateLimit = async () => {
            const identifier = getClientIdentifier();
            const status = rateLimiters.auth.getStatus(identifier);

            if (status && !status.success) {
                setFormState(prev => ({
                    ...prev,
                    rateLimited: true,
                    remainingAttempts: status.remaining,
                    error: t('auth.errors.rateLimited'),
                }));
            }
        };

        checkRateLimit();
    }, [t]);

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = field === 'email'
            ? InputSanitizer.sanitizeEmail(e.target.value)
            : e.target.value;

        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (formState.error) {
            setFormState(prev => ({ ...prev, error: '' }));
        }
    };

    const validateForm = (): boolean => {
        if (!formData.email || !formData.password) {
            setFormState(prev => ({
                ...prev,
                error: t('auth.errors.allFieldsRequired')
            }));
            return false;
        }

        if (!InputSanitizer.validateEmail(formData.email)) {
            setFormState(prev => ({
                ...prev,
                error: t('auth.errors.invalidEmail')
            }));
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Check rate limiting
        const identifier = getClientIdentifier();
        const rateLimitResult = await rateLimiters.auth.check(identifier);

        if (!rateLimitResult.success) {
            setFormState(prev => ({
                ...prev,
                rateLimited: true,
                remainingAttempts: rateLimitResult.remaining,
                error: t('auth.errors.tooManyAttempts'),
            }));

            await AuditLogger.logSecurityEvent('rate_limit_exceeded', {
                action: 'login',
                identifier,
                limit: rateLimitResult.limit,
            });

            return;
        }

        setFormState(prev => ({
            ...prev,
            isLoading: true,
            error: '',
            remainingAttempts: rateLimitResult.remaining,
        }));

        try {
            // Generate device fingerprint for security
            const deviceFingerprint = DeviceFingerprint.generate();

            const { error } = await signIn(formData.email, formData.password);

            if (error) {
                await AuditLogger.logAuthEvent('failed_login', undefined, {
                    email: formData.email,
                    deviceFingerprint,
                    reason: error.message,
                });

                setFormState(prev => ({
                    ...prev,
                    error: error.message,
                    remainingAttempts: rateLimitResult.remaining - 1,
                }));
            } else {
                await AuditLogger.logAuthEvent('login', undefined, {
                    email: formData.email,
                    deviceFingerprint,
                });

                onSuccess?.();
            }
        } catch (error) {
            console.error('Login error:', error);
            setFormState(prev => ({
                ...prev,
                error: t('auth.errors.unexpectedError')
            }));
        } finally {
            setFormState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const togglePasswordVisibility = () => {
        setFormState(prev => ({
            ...prev,
            showPassword: !prev.showPassword
        }));
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    {t('auth.login.title')}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t('auth.login.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* CSRF Token */}
                <input type="hidden" name="csrf_token" value={csrfToken} />

                {/* Error Alert */}
                {formState.error && (
                    <Alert variant="destructive" className="animate-slide-in-from-top">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{formState.error}</AlertDescription>
                    </Alert>
                )}

                {/* Rate Limit Warning */}
                {formState.rateLimited && (
                    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {t('auth.errors.rateLimitWarning', {
                                attempts: formState.remainingAttempts.toString()
                            })}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        {t('auth.login.email')}
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            className="pl-10"
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            disabled={formState.isLoading || formState.rateLimited}
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                        {t('auth.login.password')}
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="password"
                            type={formState.showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            className="pl-10 pr-10"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            disabled={formState.isLoading || formState.rateLimited}
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            disabled={formState.isLoading || formState.rateLimited}
                        >
                            {formState.showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                        disabled={formState.isLoading}
                    >
                        {t('auth.login.forgotPassword')}
                    </button>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={formState.isLoading || formState.rateLimited}
                >
                    {formState.isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>{t('common.loading')}</span>
                        </div>
                    ) : (
                        t('auth.login.submit')
                    )}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center">
                    <span className="text-sm text-muted-foreground">
                        {t('auth.login.noAccount')}{' '}
                    </span>
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                        disabled={formState.isLoading}
                    >
                        {t('auth.login.signUp')}
                    </button>
                </div>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            {t('auth.security.title')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('auth.security.description')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}