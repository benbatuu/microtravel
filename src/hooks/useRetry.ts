'use client';

import { useState, useCallback, useRef } from 'react';

export interface RetryOptions {
    maxAttempts?: number;
    delay?: number;
    backoffMultiplier?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
    shouldRetry?: (error: any, attempt: number) => boolean;
}

export interface UseRetryReturn<T> {
    execute: () => Promise<T>;
    isLoading: boolean;
    error: any;
    attempt: number;
    canRetry: boolean;
    retry: () => Promise<T>;
    reset: () => void;
}

const defaultShouldRetry = (error: any, attempt: number): boolean => {
    // Don't retry on client errors (4xx) except for 429 (rate limit)
    if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
        return false;
    }

    // Don't retry on authentication errors
    if (error?.message?.includes('auth') || error?.code?.includes('auth')) {
        return false;
    }

    // Don't retry on validation errors
    if (error?.message?.includes('validation') || error?.name === 'ValidationError') {
        return false;
    }

    return true;
};

export const useRetry = <T>(
    asyncFunction: () => Promise<T>,
    options: RetryOptions = {}
): UseRetryReturn<T> => {
    const {
        maxAttempts = 3,
        delay = 1000,
        backoffMultiplier = 2,
        maxDelay = 10000,
        onRetry,
        shouldRetry = defaultShouldRetry
    } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [attempt, setAttempt] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const calculateDelay = useCallback((attemptNumber: number): number => {
        const calculatedDelay = delay * Math.pow(backoffMultiplier, attemptNumber - 1);
        return Math.min(calculatedDelay, maxDelay);
    }, [delay, backoffMultiplier, maxDelay]);

    const execute = useCallback(async (): Promise<T> => {
        setIsLoading(true);
        setError(null);

        let currentAttempt = 0;
        let lastError: any;

        while (currentAttempt < maxAttempts) {
            currentAttempt++;
            setAttempt(currentAttempt);

            try {
                const result = await asyncFunction();
                setIsLoading(false);
                setError(null);
                return result;
            } catch (err) {
                lastError = err;
                setError(err);

                // Check if we should retry
                if (currentAttempt >= maxAttempts || !shouldRetry(err, currentAttempt)) {
                    setIsLoading(false);
                    throw err;
                }

                // Call onRetry callback
                if (onRetry) {
                    onRetry(currentAttempt, err);
                }

                // Wait before retrying
                if (currentAttempt < maxAttempts) {
                    const retryDelay = calculateDelay(currentAttempt);
                    await new Promise(resolve => {
                        timeoutRef.current = setTimeout(resolve, retryDelay);
                    });
                }
            }
        }

        setIsLoading(false);
        throw lastError;
    }, [asyncFunction, maxAttempts, shouldRetry, onRetry, calculateDelay]);

    const retry = useCallback(async (): Promise<T> => {
        return execute();
    }, [execute]);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setAttempt(0);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    const canRetry = !isLoading && error && attempt < maxAttempts && shouldRetry(error, attempt);

    return {
        execute,
        isLoading,
        error,
        attempt,
        canRetry,
        retry,
        reset
    };
};