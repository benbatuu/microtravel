export interface AppError {
    code: string;
    message: string;
    userMessage: string;
    action?: 'retry' | 'upgrade' | 'contact_support' | 'login' | 'refresh';
    details?: any;
}

export class ErrorHandler {
    static createError(
        code: string,
        message: string,
        userMessage: string,
        action?: AppError['action'],
        details?: any
    ): AppError {
        return {
            code,
            message,
            userMessage,
            action,
            details
        };
    }

    static handleAuthError(error: any): AppError {
        if (error?.message?.includes('Invalid login credentials')) {
            return this.createError(
                'AUTH_INVALID_CREDENTIALS',
                error.message,
                'Invalid email or password. Please check your credentials and try again.',
                'retry'
            );
        }

        if (error?.message?.includes('Email not confirmed')) {
            return this.createError(
                'AUTH_EMAIL_NOT_CONFIRMED',
                error.message,
                'Please check your email and click the confirmation link before signing in.',
                'contact_support'
            );
        }

        if (error?.message?.includes('Too many requests')) {
            return this.createError(
                'AUTH_RATE_LIMITED',
                error.message,
                'Too many login attempts. Please wait a few minutes before trying again.',
                'retry'
            );
        }

        if (error?.message?.includes('User already registered')) {
            return this.createError(
                'AUTH_USER_EXISTS',
                error.message,
                'An account with this email already exists. Try signing in instead.',
                'login'
            );
        }

        if (error?.message?.includes('Password should be at least')) {
            return this.createError(
                'AUTH_WEAK_PASSWORD',
                error.message,
                'Password must be at least 6 characters long.',
                'retry'
            );
        }

        return this.createError(
            'AUTH_UNKNOWN',
            error?.message || 'Authentication failed',
            'Authentication failed. Please try again or contact support.',
            'retry'
        );
    }

    static handlePaymentError(error: any): AppError {
        const stripeError = error?.error || error;

        if (stripeError?.code === 'card_declined') {
            return this.createError(
                'PAYMENT_CARD_DECLINED',
                stripeError.message,
                'Your card was declined. Please try a different payment method.',
                'retry'
            );
        }

        if (stripeError?.code === 'insufficient_funds') {
            return this.createError(
                'PAYMENT_INSUFFICIENT_FUNDS',
                stripeError.message,
                'Insufficient funds. Please check your account balance or try a different card.',
                'retry'
            );
        }

        if (stripeError?.code === 'expired_card') {
            return this.createError(
                'PAYMENT_EXPIRED_CARD',
                stripeError.message,
                'Your card has expired. Please update your payment method.',
                'retry'
            );
        }

        if (stripeError?.code === 'incorrect_cvc') {
            return this.createError(
                'PAYMENT_INCORRECT_CVC',
                stripeError.message,
                'The security code is incorrect. Please check and try again.',
                'retry'
            );
        }

        if (stripeError?.code === 'processing_error') {
            return this.createError(
                'PAYMENT_PROCESSING_ERROR',
                stripeError.message,
                'Payment processing failed. Please try again in a few moments.',
                'retry'
            );
        }

        return this.createError(
            'PAYMENT_UNKNOWN',
            stripeError?.message || 'Payment failed',
            'Payment processing failed. Please try again or contact support.',
            'contact_support'
        );
    }

    static handleSubscriptionError(error: any): AppError {
        if (error?.message?.includes('subscription_required')) {
            return this.createError(
                'SUBSCRIPTION_REQUIRED',
                error.message,
                'This feature requires a subscription. Please upgrade your plan to continue.',
                'upgrade'
            );
        }

        if (error?.message?.includes('subscription_expired')) {
            return this.createError(
                'SUBSCRIPTION_EXPIRED',
                error.message,
                'Your subscription has expired. Please renew to continue using premium features.',
                'upgrade'
            );
        }

        if (error?.message?.includes('usage_limit_exceeded')) {
            return this.createError(
                'USAGE_LIMIT_EXCEEDED',
                error.message,
                'You\'ve reached your plan\'s usage limit. Upgrade to continue or wait for your limit to reset.',
                'upgrade'
            );
        }

        return this.createError(
            'SUBSCRIPTION_UNKNOWN',
            error?.message || 'Subscription error',
            'There was an issue with your subscription. Please contact support.',
            'contact_support'
        );
    }

    static handleNetworkError(error: any): AppError {
        if (!navigator.onLine) {
            return this.createError(
                'NETWORK_OFFLINE',
                'No internet connection',
                'You\'re currently offline. Please check your internet connection.',
                'retry'
            );
        }

        if (error?.message?.includes('Failed to fetch') || error?.name === 'NetworkError') {
            return this.createError(
                'NETWORK_FAILED',
                error.message,
                'Unable to connect to our servers. Please check your connection and try again.',
                'retry'
            );
        }

        if (error?.status === 429) {
            return this.createError(
                'NETWORK_RATE_LIMITED',
                'Too many requests',
                'You\'re making requests too quickly. Please wait a moment and try again.',
                'retry'
            );
        }

        if (error?.status >= 500) {
            return this.createError(
                'NETWORK_SERVER_ERROR',
                `Server error: ${error.status}`,
                'Our servers are experiencing issues. Please try again later.',
                'retry'
            );
        }

        return this.createError(
            'NETWORK_UNKNOWN',
            error?.message || 'Network error',
            'Connection failed. Please check your internet and try again.',
            'retry'
        );
    }

    static handleValidationError(error: any): AppError {
        if (error?.message?.includes('required')) {
            return this.createError(
                'VALIDATION_REQUIRED',
                error.message,
                'Please fill in all required fields.',
                'retry'
            );
        }

        if (error?.message?.includes('invalid email')) {
            return this.createError(
                'VALIDATION_INVALID_EMAIL',
                error.message,
                'Please enter a valid email address.',
                'retry'
            );
        }

        if (error?.message?.includes('too long')) {
            return this.createError(
                'VALIDATION_TOO_LONG',
                error.message,
                'Input is too long. Please shorten your entry.',
                'retry'
            );
        }

        return this.createError(
            'VALIDATION_UNKNOWN',
            error?.message || 'Validation failed',
            'Please check your input and try again.',
            'retry'
        );
    }

    static handleGenericError(error: any): AppError {
        // Try to categorize the error
        if (error?.message?.includes('auth') || error?.code?.includes('auth')) {
            return this.handleAuthError(error);
        }

        if (error?.message?.includes('payment') || error?.code?.includes('card')) {
            return this.handlePaymentError(error);
        }

        if (error?.message?.includes('subscription')) {
            return this.handleSubscriptionError(error);
        }

        if (error?.message?.includes('fetch') || error?.name === 'NetworkError') {
            return this.handleNetworkError(error);
        }

        if (error?.message?.includes('validation') || error?.name === 'ValidationError') {
            return this.handleValidationError(error);
        }

        return this.createError(
            'UNKNOWN_ERROR',
            error?.message || 'An unexpected error occurred',
            'Something went wrong. Please try again or contact support if the problem persists.',
            'retry'
        );
    }
}