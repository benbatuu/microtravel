"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Home,
    RefreshCw,
    AlertTriangle,
    Mail,
    MessageCircle,
    ArrowLeft,
    Bug,
    Clock
} from "lucide-react";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

const troubleshootingSteps = [
    {
        step: 1,
        title: "Refresh the page",
        description: "Sometimes a simple refresh can resolve temporary issues",
        icon: <RefreshCw className="w-5 h-5" />
    },
    {
        step: 2,
        title: "Check your connection",
        description: "Ensure you have a stable internet connection",
        icon: <AlertTriangle className="w-5 h-5" />
    },
    {
        step: 3,
        title: "Clear browser cache",
        description: "Clear your browser's cache and cookies, then try again",
        icon: <Clock className="w-5 h-5" />
    },
    {
        step: 4,
        title: "Contact support",
        description: "If the problem persists, our team is here to help",
        icon: <Mail className="w-5 h-5" />
    }
];

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    const handleReportError = () => {
        // In a real implementation, this would send error details to support
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.log('Error reported:', errorDetails);
        alert('Error report sent to our team. Thank you for helping us improve!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    {/* Hero Section */}
                    <div className="space-y-6">
                        <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-16 h-16 text-white" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                500
                            </h1>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                Something Went Wrong
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                We`re experiencing some technical difficulties. Our team has been notified and is working to fix the issue.
                            </p>
                        </div>
                    </div>

                    {/* Error Details (for development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <CardContent className="p-6 text-left">
                                <div className="flex items-center mb-4">
                                    <Bug className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                        Error Details (Development Mode)
                                    </h3>
                                </div>
                                <div className="bg-red-100 dark:bg-red-900/40 rounded-lg p-4 font-mono text-sm">
                                    <p className="text-red-800 dark:text-red-200 mb-2">
                                        <strong>Message:</strong> {error.message}
                                    </p>
                                    {error.digest && (
                                        <p className="text-red-700 dark:text-red-300">
                                            <strong>Digest:</strong> {error.digest}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={reset}
                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Try Again
                        </Button>
                        <Link href="/">
                            <Button
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-8 py-3 rounded-full"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    </div>

                    {/* Troubleshooting Steps */}
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                                Troubleshooting Steps
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {troubleshootingSteps.map((step) => (
                                    <div key={step.step} className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {step.step}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {step.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support Section */}
                    <Card className="bg-gradient-to-r from-red-600/10 to-orange-600/10 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Need Immediate Help?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Our support team is available 24/7 to help resolve any issues you`re experiencing.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={handleReportError}
                                    variant="outline"
                                    className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Bug className="w-5 h-5 mr-2" />
                                    Report This Error
                                </Button>
                                <Link href="/contact">
                                    <Button
                                        variant="outline"
                                        className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Contact Support
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    <strong>Support:</strong> support@microtravel.com | +1 (555) 123-4567
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Back Navigation */}
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back to Previous Page
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}