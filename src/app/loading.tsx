"use client";

import React from "react";
import { Globe } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors">
            <div className="text-center space-y-8 px-6">
                {/* Logo */}
                <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-md">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                        MicroTravel
                    </span>
                </div>

                {/* Spinner */}
                <div className="flex flex-col items-center space-y-4">
                    <LoadingSpinner size="xl" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Loading your next adventure...
                    </p>
                </div>

                {/* Dots animation */}
                <div className="flex justify-center space-x-2">
                    {[0, 150, 300].map((delay, i) => (
                        <div
                            key={i}
                            className="w-3 h-3 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
