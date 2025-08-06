"use client";

import React from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Globe } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
            <div className="text-center space-y-8">
                {/* Logo */}
                <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
                        <Globe className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        MicroTravel
                    </span>
                </div>

                {/* Loading Spinner */}
                <div className="flex flex-col items-center space-y-4">
                    <LoadingSpinner size="xl" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Loading your next adventure...
                    </p>
                </div>

                {/* Loading Animation */}
                <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}