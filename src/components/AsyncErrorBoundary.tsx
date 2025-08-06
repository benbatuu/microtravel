'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface AsyncErrorBoundaryProps {
    children: ReactNode;
    onRetry?: () => void;
    retryText?: string;
}

interface AsyncErrorFallbackProps {
    error: Error;
    onRetry?: () => void;
    retryText?: string;
}

const AsyncErrorFallback: React.FC<AsyncErrorFallbackProps> = ({
    error,
    onRetry,
    retryText = 'Try Again'
}) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const isNetworkError = error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch');

    const getErrorMessage = () => {
        if (!isOnline) {
            return "You're currently offline. Please check your internet connection.";
        }

        if (isNetworkError) {
            return "Unable to connect to our servers. Please check your connection and try again.";
        }

        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            return "Your session has expired. Please log in again.";
        }

        if (error.message.includes('403') || error.message.includes('forbidden')) {
            return "You don't have permission to access this resource.";
        }

        if (error.message.includes('404')) {
            return "The requested resource could not be found.";
        }

        if (error.message.includes('500')) {
            return "Our servers are experiencing issues. Please try again later.";
        }

        return "Something went wrong while loading this content.";
    };

    const getIcon = () => {
        if (!isOnline) {
            return <WifiOff className="h-6 w-6 text-red-600" />;
        }

        if (isNetworkError) {
            return <Wifi className="h-6 w-6 text-orange-600" />;
        }

        return <AlertTriangle className="h-6 w-6 text-red-600" />;
    };

    return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        {getIcon()}
                    </div>
                    <CardTitle className="text-lg">
                        {!isOnline ? 'Connection Lost' : 'Loading Failed'}
                    </CardTitle>
                    <CardDescription>
                        {getErrorMessage()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            className="w-full"
                            disabled={!isOnline && isNetworkError}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {retryText}
                        </Button>
                    )}
                    {!isOnline && (
                        <p className="text-sm text-muted-foreground text-center">
                            Waiting for connection...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
    children,
    onRetry,
    retryText
}) => {
    return (
        <ErrorBoundary
            fallback={
                <AsyncErrorFallback
                    error={new Error('Async operation failed')}
                    onRetry={onRetry}
                    retryText={retryText}
                />
            }
        >
            {children}
        </ErrorBoundary>
    );
};