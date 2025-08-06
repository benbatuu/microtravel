'use client';

import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, CreditCard, LogIn, ExternalLink } from 'lucide-react';
import { AppError } from '@/lib/error-handling';

interface ErrorToastProps {
    error: AppError;
    onRetry?: () => void;
    onUpgrade?: () => void;
    onLogin?: () => void;
    onContactSupport?: () => void;
}

export const showErrorToast = (
    error: AppError,
    actions?: {
        onRetry?: () => void;
        onUpgrade?: () => void;
        onLogin?: () => void;
        onContactSupport?: () => void;
    }
) => {
    const getIcon = () => {
        switch (error.action) {
            case 'upgrade':
                return <CreditCard className="h-4 w-4" />;
            case 'login':
                return <LogIn className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getActionButton = () => {
        switch (error.action) {
            case 'retry':
                return actions?.onRetry ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={actions.onRetry}
                        className="ml-2"
                    >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Try Again
                    </Button>
                ) : null;

            case 'upgrade':
                return actions?.onUpgrade ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={actions.onUpgrade}
                        className="ml-2"
                    >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Upgrade
                    </Button>
                ) : null;

            case 'login':
                return actions?.onLogin ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={actions.onLogin}
                        className="ml-2"
                    >
                        <LogIn className="h-3 w-3 mr-1" />
                        Sign In
                    </Button>
                ) : null;

            case 'contact_support':
                return actions?.onContactSupport ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={actions.onContactSupport}
                        className="ml-2"
                    >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Support
                    </Button>
                ) : null;

            default:
                return null;
        }
    };

    toast.error(
        <div className="flex items-start justify-between w-full">
            <div className="flex items-start space-x-2">
                {getIcon()}
                <div>
                    <p className="font-medium text-sm">{error.userMessage}</p>
                    {process.env.NODE_ENV === 'development' && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {error.code}: {error.message}
                        </p>
                    )}
                </div>
            </div>
            {getActionButton()}
        </div>,
        {
            duration: error.action === 'contact_support' ? 10000 : 5000,
            dismissible: true,
        }
    );
};

export const ErrorToast: React.FC<ErrorToastProps> = ({
    error,
    onRetry,
    onUpgrade,
    onLogin,
    onContactSupport
}) => {
    React.useEffect(() => {
        showErrorToast(error, {
            onRetry,
            onUpgrade,
            onLogin,
            onContactSupport
        });
    }, [error, onRetry, onUpgrade, onLogin, onContactSupport]);

    return null;
};