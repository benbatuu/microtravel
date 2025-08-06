import { NextRequest, NextResponse } from 'next/server';

export interface ApiError {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
    timestamp: string;
    path: string;
    method: string;
}

export class ApiErrorHandler {
    static createError(
        code: string,
        message: string,
        statusCode: number = 500,
        details?: any
    ): ApiError {
        return {
            code,
            message,
            statusCode,
            details,
            timestamp: new Date().toISOString(),
            path: '',
            method: ''
        };
    }

    static handleSupabaseError(error: any): ApiError {
        // Authentication errors
        if (error?.message?.includes('Invalid login credentials')) {
            return this.createError(
                'SUPABASE_AUTH_INVALID_CREDENTIALS',
                'Invalid login credentials',
                401,
                error
            );
        }

        if (error?.message?.includes('Email not confirmed')) {
            return this.createError(
                'SUPABASE_AUTH_EMAIL_NOT_CONFIRMED',
                'Email address not confirmed',
                401,
                error
            );
        }

        if (error?.message?.includes('User already registered')) {
            return this.createError(
                'SUPABASE_AUTH_USER_EXISTS',
                'User already exists with this email',
                409,
                error
            );
        }

        // Database errors
        if (error?.code === '23505') { // Unique constraint violation
            return this.createError(
                'SUPABASE_DB_UNIQUE_VIOLATION',
                'Resource already exists',
                409,
                error
            );
        }

        if (error?.code === '23503') { // Foreign key violation
            return this.createError(
                'SUPABASE_DB_FOREIGN_KEY_VIOLATION',
                'Referenced resource does not exist',
                400,
                error
            );
        }

        if (error?.code === '42P01') { // Table does not exist
            return this.createError(
                'SUPABASE_DB_TABLE_NOT_FOUND',
                'Database table not found',
                500,
                error
            );
        }

        // Storage errors
        if (error?.message?.includes('storage')) {
            return this.createError(
                'SUPABASE_STORAGE_ERROR',
                'File storage operation failed',
                500,
                error
            );
        }

        // Generic Supabase error
        return this.createError(
            'SUPABASE_UNKNOWN_ERROR',
            error?.message || 'Database operation failed',
            500,
            error
        );
    }

    static handleStripeError(error: any): ApiError {
        const stripeError = error?.error || error;

        if (stripeError?.type === 'card_error') {
            return this.createError(
                'STRIPE_CARD_ERROR',
                stripeError.message || 'Card payment failed',
                400,
                stripeError
            );
        }

        if (stripeError?.type === 'rate_limit_error') {
            return this.createError(
                'STRIPE_RATE_LIMIT',
                'Too many requests to payment processor',
                429,
                stripeError
            );
        }

        if (stripeError?.type === 'invalid_request_error') {
            return this.createError(
                'STRIPE_INVALID_REQUEST',
                stripeError.message || 'Invalid payment request',
                400,
                stripeError
            );
        }

        if (stripeError?.type === 'api_connection_error') {
            return this.createError(
                'STRIPE_CONNECTION_ERROR',
                'Payment processor connection failed',
                503,
                stripeError
            );
        }

        if (stripeError?.type === 'api_error') {
            return this.createError(
                'STRIPE_API_ERROR',
                'Payment processor error',
                500,
                stripeError
            );
        }

        if (stripeError?.type === 'authentication_error') {
            return this.createError(
                'STRIPE_AUTH_ERROR',
                'Payment processor authentication failed',
                500,
                stripeError
            );
        }

        return this.createError(
            'STRIPE_UNKNOWN_ERROR',
            stripeError?.message || 'Payment processing failed',
            500,
            stripeError
        );
    }

    static handleValidationError(error: any): ApiError {
        if (error?.name === 'ValidationError') {
            return this.createError(
                'VALIDATION_ERROR',
                error.message || 'Validation failed',
                400,
                error.details
            );
        }

        if (error?.message?.includes('required')) {
            return this.createError(
                'VALIDATION_REQUIRED_FIELD',
                'Required field missing',
                400,
                error
            );
        }

        if (error?.message?.includes('invalid')) {
            return this.createError(
                'VALIDATION_INVALID_FORMAT',
                'Invalid data format',
                400,
                error
            );
        }

        return this.createError(
            'VALIDATION_UNKNOWN',
            error?.message || 'Data validation failed',
            400,
            error
        );
    }

    static handleGenericError(error: any): ApiError {
        // Try to categorize the error
        if (error?.message?.includes('supabase') || error?.code) {
            return this.handleSupabaseError(error);
        }

        if (error?.type?.includes('stripe') || error?.error?.type) {
            return this.handleStripeError(error);
        }

        if (error?.name === 'ValidationError' || error?.message?.includes('validation')) {
            return this.handleValidationError(error);
        }

        // Network/timeout errors
        if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
            return this.createError(
                'NETWORK_CONNECTION_ERROR',
                'External service connection failed',
                503,
                error
            );
        }

        // Rate limiting
        if (error?.status === 429) {
            return this.createError(
                'RATE_LIMIT_EXCEEDED',
                'Too many requests',
                429,
                error
            );
        }

        // Generic server error
        return this.createError(
            'INTERNAL_SERVER_ERROR',
            error?.message || 'An unexpected error occurred',
            500,
            error
        );
    }

    static createErrorResponse(error: ApiError, request?: NextRequest): NextResponse {
        // Add request context if available
        if (request) {
            error.path = request.nextUrl.pathname;
            error.method = request.method;
        }

        // Log error for debugging
        console.error('API Error:', {
            ...error,
            stack: error.details?.stack
        });

        // Don't expose sensitive information in production
        const responseError = {
            code: error.code,
            message: error.message,
            timestamp: error.timestamp,
            ...(process.env.NODE_ENV === 'development' && {
                details: error.details,
                path: error.path,
                method: error.method
            })
        };

        return NextResponse.json(
            { error: responseError },
            { status: error.statusCode }
        );
    }
}

// Middleware wrapper for API routes
export function withErrorHandler(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context?: any): Promise<NextResponse> => {
        try {
            return await handler(request, context);
        } catch (error) {
            const apiError = ApiErrorHandler.handleGenericError(error);
            return ApiErrorHandler.createErrorResponse(apiError, request);
        }
    };
}

// Async operation wrapper with error handling
export async function withAsyncErrorHandler<T>(
    operation: () => Promise<T>,
    errorContext?: string
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        const apiError = ApiErrorHandler.handleGenericError(error);

        // Add context if provided
        if (errorContext) {
            apiError.details = {
                ...apiError.details,
                context: errorContext
            };
        }

        throw apiError;
    }
}