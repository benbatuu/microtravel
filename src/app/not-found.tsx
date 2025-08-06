"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, MapPin, Compass, HelpCircle } from "lucide-react";

const popularPages = [
    {
        title: "Home",
        description: "Return to our homepage",
        href: "/",
        icon: <Home className="w-5 h-5" />,
    },
    {
        title: "Explore Experiences",
        description: "Browse our travel experiences",
        href: "/dashboard/explore",
        icon: <Compass className="w-5 h-5" />,
    },
    {
        title: "Help Center",
        description: "Find answers to your questions",
        href: "/help",
        icon: <HelpCircle className="w-5 h-5" />,
    },
    {
        title: "Contact Us",
        description: "Get in touch with our team",
        href: "/contact",
        icon: <MapPin className="w-5 h-5" />,
    },
];


export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    {/* Hero Section */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-7xl font-bold text-gray-900 dark:text-white">404</h1>
                            <h2 className="text-3xl md:text-4xl font-semibold text-gray-700 dark:text-gray-200">
                                Oops! Page Not Found
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                It looks like you’ve wandered off the beaten path. The page you’re looking for
                                doesn’t exist, but don’t worry – we’ll help you get back on track.
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button className="px-6 py-3">
                                <Home className="w-5 h-5 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => window.history.back()} className="px-6 py-3">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Go Back
                        </Button>
                    </div>

                    {/* Popular Pages */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Pages</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {popularPages.map((page, index) => (
                                <Link key={index} href={page.href}>
                                    <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition cursor-pointer">
                                        <CardContent className="p-6 flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-300">
                                                {page.icon}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {page.title}
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{page.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Help Section */}
                    <Card className="bg-white dark:bg-gray-800 shadow-md">
                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Still Can’t Find What You’re Looking For?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Our support team is here to help you navigate and find exactly what you need.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/help">
                                    <Button variant="outline">
                                        <HelpCircle className="w-5 h-5 mr-2" />
                                        Visit Help Center
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        Contact Support
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
