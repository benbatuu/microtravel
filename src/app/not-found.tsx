"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, MapPin, Compass, HelpCircle } from "lucide-react";
import Image from "next/image";

const popularPages = [
    {
        title: "Home",
        description: "Return to our homepage",
        href: "/",
        icon: <Home className="w-5 h-5" />
    },
    {
        title: "Explore Experiences",
        description: "Browse our travel experiences",
        href: "/dashboard/explore",
        icon: <Compass className="w-5 h-5" />
    },
    {
        title: "Help Center",
        description: "Find answers to your questions",
        href: "/help",
        icon: <HelpCircle className="w-5 h-5" />
    },
    {
        title: "Contact Us",
        description: "Get in touch with our team",
        href: "/contact",
        icon: <MapPin className="w-5 h-5" />
    }
];

const searchSuggestions = [
    "micro travel experiences",
    "weekend getaways",
    "booking help",
    "account settings",
    "payment issues"
];

export default function NotFound() {
    const handleSearch = (query: string) => {
        // In a real implementation, this would redirect to a search results page
        window.location.href = `/help?search=${encodeURIComponent(query)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    {/* Hero Section */}
                    <div className="space-y-6">
                        <div className="relative w-64 h-64 mx-auto">
                            <Image
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                                alt="Lost traveler"
                                fill
                                className="rounded-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-blue-600/20 rounded-full"></div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                404
                            </h1>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                Oops! Page Not Found
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                It looks like you`ve wandered off the beaten path. The page you`re looking for doesn`t exist,
                                but don`t worry – we`ll help you find your way back to your next adventure.
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full shadow-lg transform transition-all hover:scale-105">
                                <Home className="w-5 h-5 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-3 rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Go Back
                        </Button>
                    </div>

                    {/* Search Section */}
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-center mb-6">
                                <Search className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Search for What You Need
                                </h3>
                            </div>

                            <div className="max-w-md mx-auto mb-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search our site..."
                                        className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch((e.target as HTMLInputElement).value);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Popular searches:
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {searchSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearch(suggestion)}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Popular Pages */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Popular Pages
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {popularPages.map((page, index) => (
                                <Link key={index} href={page.href}>
                                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                                        <CardContent className="p-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white">
                                                    {page.icon}
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {page.title}
                                                    </h4>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                        {page.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Help Section */}
                    <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Still Can`t Find What You`re Looking For?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Our support team is here to help you navigate and find exactly what you need.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/help">
                                    <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                        <HelpCircle className="w-5 h-5 mr-2" />
                                        Visit Help Center
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
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