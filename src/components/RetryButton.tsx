'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetryButtonProps {
    onRetry: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    attempt?: number;
    maxAttempts?: number;
    error?: any;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'default' | 'lg';
    showAttempts?: boolean;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
    onRetry,
    isLoading = false,
    disabled = false,
    attempt = 0,
    maxAttempts = 3,
    error,
    className,
    variant = 'outline',
    size = 'default',
    showAttempts = true
}) => {
    const canRetry = attempt < maxAttempts && !disabled;
    const isRetrying = isLoading;

    const getButtonText = () => {
        if (isRetrying) {
            return 'Retrying...';
        }

        if (attempt === 0) {
            return 'Try Again';
        }

        if (showAttempts && maxAttempts > 1) {
            return `Retry (${attempt}/${maxAttempts})`;
        }

        return 'Retry';
    };

    return (
        <Button
            onClick={onRetry}
            disabled={!canRetry || isRetrying}
            variant={variant}
            size={size}
            className={cn(
                'transition-all duration-200',
                !canRetry && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            {isRetrying ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {getButtonText()}
        </Button>
    );
};

interface RetryCardProps {
    title?: string;
    message?: string;
    error?: any;
    onRetry: () => void;
    isLoading?: boolean;
    attempt?: number;
    maxAttempts?: number;
    className?: string;
    showErrorDetails?: boolean;
}

export const RetryCard: React.FC<RetryCardProps> = ({
    title = 'Something went wrong',
    message = 'An error occurred while loading this content.',
    error,
    onRetry,
    isLoading = false,
    attempt = 0,
    maxAttempts = 3,
    className,
    showErrorDetails = false
}) => {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center p-6 text-center space-y-4',
            'border border-dashed border-gray-300 rounded-lg bg-gray-50/50',
            className
        )}>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 max-w-sm">{message}</p>
            </div>

            <RetryButton
                onRetry={onRetry}
                isLoading={isLoading}
                attempt={attempt}
                maxAttempts={maxAttempts}
                error={error}
            />

            {showErrorDetails && error && process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left w-full">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                        Error Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(error, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};