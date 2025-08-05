/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from 'stripe'

export interface PaymentErrorDetails {
    code: string
    message: string
    userMessage: string
    action: 'retry' | 'upgrade' | 'contact_support' | 'update_payment_method'
    severity: 'error' | 'warning' | 'info'
}

/**
 * Convert Stripe errors to user-friendly error messages
 */
export function handleStripeError(error: any): PaymentErrorDetails {
    if (error instanceof Stripe.errors.StripeError) {
        switch (error.code) {
            case 'card_declined':
                return {
                    code: 'CARD_DECLINED',
                    message: error.message,
                    userMessage: 'Your card was declined. Please try a different payment method.',
                    action: 'update_payment_method',
                    severity: 'error'
                }

            case 'insufficient_funds':
                return {
                    code: 'INSUFFICIENT_FUNDS',
                    message: error.message,
                    userMessage: 'Insufficient funds. Please check your account balance or try a different card.',
                    action: 'update_payment_method',
                    severity: 'error'
                }

            case 'expired_card':
                return {
                    code: 'EXPIRED_CARD',
                    message: error.message,
                    userMessage: 'Your card has expired. Please update your payment method.',
                    action: 'update_payment_method',
                    severity: 'error'
                }

            case 'incorrect_cvc':
                return {
                    code: 'INCORRECT_CVC',
                    message: error.message,
                    userMessage: 'The security code is incorrect. Please check and try again.',
                    action: 'retry',
                    severity: 'error'
                }

            case 'processing_error':
                return {
                    code: 'PROCESSING_ERROR',
                    message: error.message,
                    userMessage: 'Payment processing error. Please try again in a few minutes.',
                    action: 'retry',
                    severity: 'error'
                }

            case 'rate_limit':
                return {
                    code: 'RATE_LIMIT',
                    message: error.message,
                    userMessage: 'Too many requests. Please wait a moment and try again.',
                    action: 'retry',
                    severity: 'warning'
                }

            case 'api_key_expired':
            case 'authentication_required':
                return {
                    code: 'AUTHENTICATION_ERROR',
                    message: error.message,
                    userMessage: 'Authentication error. Please contact support.',
                    action: 'contact_support',
                    severity: 'error'
                }

            case 'customer_not_found':
                return {
                    code: 'CUSTOMER_NOT_FOUND',
                    message: error.message,
                    userMessage: 'Customer account not found. Please contact support.',
                    action: 'contact_support',
                    severity: 'error'
                }

            case 'subscription_not_found':
                return {
                    code: 'SUBSCRIPTION_NOT_FOUND',
                    message: error.message,
                    userMessage: 'Subscription not found. Please contact support.',
                    action: 'contact_support',
                    severity: 'error'
                }

            case 'invoice_not_found':
                return {
                    code: 'INVOICE_NOT_FOUND',
                    message: error.message,
                    userMessage: 'Invoice not found. Please contact support.',
                    action: 'contact_support',
                    severity: 'error'
                }

            case 'payment_method_unactivated':
                return {
                    code: 'PAYMENT_METHOD_UNACTIVATED',
                    message: error.message,
                    userMessage: 'Payment method needs to be activated. Please contact your bank.',
                    action: 'update_payment_method',
                    severity: 'error'
                }

            case 'payment_intent_authentication_failure':
                return {
                    code: 'AUTHENTICATION_FAILURE',
                    message: error.message,
                    userMessage: 'Payment authentication failed. Please try again or use a different card.',
                    action: 'retry',
                    severity: 'error'
                }

            default:
                return {
                    code: error.code || 'STRIPE_ERROR',
                    message: error.message,
                    userMessage: 'Payment error occurred. Please try again or contact support.',
                    action: 'retry',
                    severity: 'error'
                }
        }
    }

    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
            code: 'NETWORK_ERROR',
            message: error.message,
            userMessage: 'Network connection error. Please check your internet connection and try again.',
            action: 'retry',
            severity: 'error'
        }
    }

    // Handle timeout errors
    if (error.code === 'ETIMEDOUT') {
        return {
            code: 'TIMEOUT_ERROR',
            message: error.message,
            userMessage: 'Request timed out. Please try again.',
            action: 'retry',
            severity: 'error'
        }
    }

    // Generic error fallback
    return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'Unknown error occurred',
        userMessage: 'An unexpected error occurred. Please try again or contact support.',
        action: 'contact_support',
        severity: 'error'
    }
}

/**
 * Log payment errors for monitoring
 */
export function logPaymentError(
    error: PaymentErrorDetails,
    context: {
        userId?: string
        operation: string
        metadata?: Record<string, any>
    }
): void {
    const logData = {
        timestamp: new Date().toISOString(),
        error: {
            code: error.code,
            message: error.message,
            severity: error.severity
        },
        context,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    }

    // In production, you might want to send this to a logging service
    console.error('Payment Error:', logData)

    // You could also send to external services like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(new Error(error.message), { extra: logData })
}

/**
 * Retry logic for payment operations
 */
export class PaymentRetryManager {
    private maxRetries: number
    private baseDelay: number
    private maxDelay: number

    constructor(maxRetries = 3, baseDelay = 1000, maxDelay = 10000) {
        this.maxRetries = maxRetries
        this.baseDelay = baseDelay
        this.maxDelay = maxDelay
    }

    async executeWithRetry<T>(
        operation: () => Promise<T>,
        context: { userId?: string; operation: string; metadata?: Record<string, any> }
    ): Promise<T> {
        let lastError: any

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation()
            } catch (error) {
                lastError = error
                const errorDetails = handleStripeError(error)

                // Don't retry certain types of errors
                if (errorDetails.action !== 'retry' || attempt === this.maxRetries) {
                    logPaymentError(errorDetails, {
                        ...context,
                        metadata: {
                            ...(context.metadata || {}),
                            attempt
                        }
                    })
                    throw error
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    this.baseDelay * Math.pow(2, attempt - 1),
                    this.maxDelay
                )

                console.warn(`Payment operation failed (attempt ${attempt}/${this.maxRetries}), retrying in ${delay}ms:`, errorDetails.message)

                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }

        throw lastError
    }
}

/**
 * Validate payment amount and currency
 */
export function validatePaymentAmount(
    amount: number,
    currency: string = 'usd'
): { isValid: boolean; error?: PaymentErrorDetails } {
    if (amount < 50) { // Stripe minimum is $0.50
        return {
            isValid: false,
            error: {
                code: 'AMOUNT_TOO_SMALL',
                message: 'Amount is below minimum',
                userMessage: 'Payment amount is too small. Minimum is $0.50.',
                action: 'retry',
                severity: 'error'
            }
        }
    }

    if (amount > 99999999) { // Stripe maximum
        return {
            isValid: false,
            error: {
                code: 'AMOUNT_TOO_LARGE',
                message: 'Amount exceeds maximum',
                userMessage: 'Payment amount is too large. Please contact support for large payments.',
                action: 'contact_support',
                severity: 'error'
            }
        }
    }

    const supportedCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud']
    if (!supportedCurrencies.includes(currency.toLowerCase())) {
        return {
            isValid: false,
            error: {
                code: 'UNSUPPORTED_CURRENCY',
                message: 'Currency not supported',
                userMessage: 'This currency is not supported. Please contact support.',
                action: 'contact_support',
                severity: 'error'
            }
        }
    }

    return { isValid: true }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
    const errorDetails = handleStripeError(error)
    return errorDetails.action === 'retry'
}

/**
 * Get user-friendly error message for display
 */
export function getErrorMessage(error: any): string {
    const errorDetails = handleStripeError(error)
    return errorDetails.userMessage
}

/**
 * Get suggested action for error
 */
export function getErrorAction(error: any): PaymentErrorDetails['action'] {
    const errorDetails = handleStripeError(error)
    return errorDetails.action
}