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
    xl: "w-12 h-12",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-2 border-muted border-t-primary transition-colors",
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
            {[0, 150, 300].map((delay, i) => (
                <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce transition-colors"
                    style={{ animationDelay: `${delay}ms` }}
                />
            ))}
        </div>
    );
}

interface LoadingPulseProps {
    className?: string;
}

export function LoadingPulse({ className }: LoadingPulseProps) {
    return (
        <div className={cn("flex space-x-2", className)}>
            {[0, 200, 400].map((delay, i) => (
                <div
                    key={i}
                    className="w-3 h-3 bg-primary rounded-full animate-pulse transition-colors"
                    style={{ animationDelay: `${delay}ms` }}
                />
            ))}
        </div>
    );
}
