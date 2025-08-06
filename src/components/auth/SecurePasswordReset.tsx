"use client";

import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { InputSanitizer, CSRFProtection, AuditLogger } from '@/lib/security';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';

interface SecurePasswordResetProps {
    onBackToLogin?: () => void;
}

export function SecurePasswordReset({ onBackToLogin }: SecurePasswordResetProps) {
    const { resetPassword } = useAuth();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        email: '',
    });

    const [formState, setFormState] = useState({
        isLoading: false,
        error: '',
        success: false,
        rateLimited: false,
        remainingAttempts: 3,
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
            const status = rateLimiters.passwordReset.getStatus(identifier);

            if (status && !status.success) {
                setFormState(prev => ({
                    ...prev,
                    rateLimited: true,
                    remainingAttempts: status.remaining,
                    error: t('auth.errors.passwordResetRateLimited'),
                }));
            }
        };

        checkRateLimit();
    }, [t]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = InputSanitizer.sanitizeEmail(e.target.value);
        setFormData({ email: value });

        // Clear error when user starts typing
        if (formState.error) {
            setFormState(prev => ({ ...prev, error: '' }));
        }
    };

    const validateForm = (): boolean => {
        if (!formData.email) {
            setFormState(prev => ({
                ...prev,
                error: t('auth.errors.emailRequired')
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
        const rateLimitResult = await rateLimiters.passwordReset.check(identifier);

        if (!rateLimitResult.success) {
            setFormState(prev => ({
                ...prev,
                rateLimited: true,
                remainingAttempts: rateLimitResult.remaining,
                error: t('auth.errors.passwordResetTooManyAttempts'),
            }));

            await AuditLogger.logSecurityEvent('rate_limit_exceeded', {
                action: 'password_reset',
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
            const { error } = await resetPassword(formData.email);

            if (error) {
                await AuditLogger.logAuthEvent('password_reset', undefined, {
                    email: formData.email,
                    success: false,
                    reason: error.message,
                });

                setFormState(prev => ({
                    ...prev,
                    error: error.message,
                    remainingAttempts: rateLimitResult.remaining - 1,
                }));
            } else {
                await AuditLogger.logAuthEvent('password_reset', undefined, {
                    email: formData.email,
                    success: true,
                });

                setFormState(prev => ({
                    ...prev,
                    success: true
                }));
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setFormState(prev => ({
                ...prev,
                error: t('auth.errors.unexpectedError')
            }));
        } finally {
            setFormState(prev => ({ ...prev, isLoading: false }));
        }
    };

    if (formState.success) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t('auth.passwordReset.successTitle')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('auth.passwordReset.successMessage', { email: formData.email })}
                    </p>
                </div>

                <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            {t('auth.passwordReset.checkEmail')}
                        </AlertDescription>
                    </Alert>

                    <Button
                        onClick={onBackToLogin}
                        variant="outline"
                        className="w-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('auth.passwordReset.backToLogin')}
                    </Button>
                </div>

                {/* Security Notice */}
                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {t('auth.security.passwordResetTitle')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('auth.security.passwordResetDescription')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    {t('auth.forgotPassword.title')}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t('auth.forgotPassword.subtitle')}
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
                            {t('auth.errors.passwordResetRateLimitWarning', {
                                attempts: formState.remainingAttempts.toString()
                            })}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        {t('auth.forgotPassword.email')}
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            disabled={formState.isLoading || formState.rateLimited}
                        />
                    </div>
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
                        t('auth.forgotPassword.submit')
                    )}
                </Button>

                {/* Back to Login */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBackToLogin}
                    className="w-full"
                    disabled={formState.isLoading}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('auth.forgotPassword.backToLogin')}
                </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            {t('auth.security.resetSecurityTitle')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('auth.security.resetSecurityDescription')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}