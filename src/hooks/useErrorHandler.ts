'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorHandler, AppError } from '@/lib/error-handling';
import { showErrorToast } from '@/components/ErrorToast';

export interface UseErrorHandlerOptions {
    showToast?: boolean;
    redirectOnAuth?: boolean;
    redirectOnSubscription?: boolean;
}

export interface UseErrorHandlerReturn {
    handleError: (error: any, options?: UseErrorHandlerOptions) => AppError;
    handleAuthError: (error: any) => AppError;
    handlePaymentError: (error: any) => AppError;
    handleSubscriptionError: (error: any) => AppError;
    handleNetworkError: (error: any) => AppError;
    handleValidationError: (error: any) => AppError;
}

export const useErrorHandler = (
    defaultOptions: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn => {
    const router = useRouter();

    const {
        showToast = true,
        redirectOnAuth = true,
        redirectOnSubscription = true
    } = defaultOptions;

    const handleError = useCallback((
        error: any,
        options: UseErrorHandlerOptions = {}
    ): AppError => {
        const opts = { ...defaultOptions, ...options };
        const appError = ErrorHandler.handleGenericError(error);

        // Show toast notification if enabled
        if (opts.showToast) {
            showErrorToast(appError, {
                onRetry: () => {
                    // This will be handled by the calling component
                },
                onUpgrade: () => {
                    if (opts.redirectOnSubscription) {
                        router.push('/dashboard/subscription');
                    }
                },
                onLogin: () => {
                    if (opts.redirectOnAuth) {
                        router.push('/auth/login');
                    }
                },
                onContactSupport: () => {
                    router.push('/contact');
                }
            });
        }

        // Handle automatic redirects
        if (opts.redirectOnAuth && appError.action === 'login') {
            router.push('/auth/login');
        }

        if (opts.redirectOnSubscription && appError.action === 'upgrade') {
            router.push('/dashboard/subscription');
        }

        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error handled:', {
                original: error,
                processed: appError
            });
        }

        return appError;
    }, [router, defaultOptions]);

    const handleAuthError = useCallback((error: any): AppError => {
        const appError = ErrorHandler.handleAuthError(error);

        if (showToast) {
            showErrorToast(appError, {
                onLogin: () => {
                    if (redirectOnAuth) {
                        router.push('/auth/login');
                    }
                },
                onContactSupport: () => {
                    router.push('/contact');
                }
            });
        }

        return appError;
    }, [router, showToast, redirectOnAuth]);

    const handlePaymentError = useCallback((error: any): AppError => {
        const appError = ErrorHandler.handlePaymentError(error);

        if (showToast) {
            showErrorToast(appError, {
                onContactSupport: () => {
                    router.push('/contact');
                }
            });
        }

        return appError;
    }, [router, showToast]);

    const handleSubscriptionError = useCallback((error: any): AppError => {
        const appError = ErrorHandler.handleSubscriptionError(error);

        if (showToast) {
            showErrorToast(appError, {
                onUpgrade: () => {
                    if (redirectOnSubscription) {
                        router.push('/dashboard/subscription');
                    }
                },
                onContactSupport: () => {
                    router.push('/contact');
                }
            });
        }

        return appError;
    }, [router, showToast, redirectOnSubscription]);

    const handleNetworkError = useCallback((error: any): AppError => {
        const appError = ErrorHandler.handleNetworkError(error);

        if (showToast) {
            showErrorToast(appError);
        }

        return appError;
    }, [showToast]);

    const handleValidationError = useCallback((error: any): AppError => {
        const appError = ErrorHandler.handleValidationError(error);

        if (showToast) {
            showErrorToast(appError);
        }

        return appError;
    }, [showToast]);

    return {
        handleError,
        handleAuthError,
        handlePaymentError,
        handleSubscriptionError,
        handleNetworkError,
        handleValidationError
    };
};