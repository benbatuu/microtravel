"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 dark:border-gray-600 dark:border-t-purple-400",
                sizeClasses[size],
                className
            )}
        />
    );
}

interface LoadingDotsProps {
    className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
    return (
        <div className={cn("flex space-x-1", className)}>
            <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    );
}

interface LoadingPulseProps {
    className?: string;
}

export function LoadingPulse({ className }: LoadingPulseProps) {
    return (
        <div className={cn("flex space-x-2", className)}>
            <div className="w-3 h-3 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-purple-600 dark:bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
    );
}