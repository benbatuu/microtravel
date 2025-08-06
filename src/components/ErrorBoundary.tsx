'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <CardTitle className="text-xl">Something went wrong</CardTitle>
                            <CardDescription>
                                We encountered an unexpected error. Please try again or contact support if the problem persists.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={this.handleRetry}
                                className="w-full"
                                variant="default"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="w-full"
                            >
                                Reload Page
                            </Button>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4 text-sm">
                                    <summary className="cursor-pointer font-medium">Error Details</summary>
                                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}