"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Settings,
    Clock,
    Mail,
    Bell,
    CheckCircle,
    Globe,
    Wrench,
    Zap,
    Shield
} from "lucide-react";

const maintenanceFeatures = [
    {
        icon: <Zap className="w-6 h-6" />,
        title: "Performance Improvements",
        description: "Optimizing our servers for faster load times and better user experience"
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: "Security Updates",
        description: "Implementing the latest security patches to keep your data safe"
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: "New Features",
        description: "Adding exciting new features to enhance your micro-travel experience"
    }
];

const socialLinks = [
    { name: "Twitter", url: "https://twitter.com/microtravel", handle: "@microtravel" },
    { name: "Instagram", url: "https://instagram.com/microtravel", handle: "@microtravel" },
    { name: "Facebook", url: "https://facebook.com/microtravel", handle: "MicroTravel" }
];

export default function MaintenancePage() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState({
        hours: 2,
        minutes: 30,
        seconds: 0
    });

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleNotifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail("");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    {/* Hero Section */}
                    <div className="space-y-6">
                        <div className="w-32 h-32 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Settings className="w-16 h-16 text-white animate-spin" style={{ animationDuration: '3s' }} />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                We`ll Be Right Back!
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                MicroTravel is currently undergoing scheduled maintenance to bring you an even better experience.
                                We appreciate your patience while we make these improvements.
                            </p>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-center mb-6">
                                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Estimated Time Remaining
                                </h2>
                            </div>

                            <div className="flex justify-center space-x-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-2">
                                        {timeRemaining.hours.toString().padStart(2, '0')}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Hours</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-2">
                                        {timeRemaining.minutes.toString().padStart(2, '0')}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Minutes</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-2">
                                        {timeRemaining.seconds.toString().padStart(2, '0')}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Seconds</p>
                                </div>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
                                * This is an estimated time and may vary based on the complexity of updates
                            </p>
                        </CardContent>
                    </Card>

                    {/* What We're Working On */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            What We`re Working On
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {maintenanceFeatures.map((feature, index) => (
                                <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Notification Signup */}
                    <Card className="bg-gradient-to-r from-orange-600/10 to-yellow-600/10 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            {subscribed ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        You`re All Set!
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        We`ll notify you as soon as we`re back online. Thank you for your patience!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-center mb-4">
                                        <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Get Notified When We`re Back
                                        </h3>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        Enter your email address and we`ll send you a notification as soon as MicroTravel is back online.
                                    </p>

                                    <form onSubmit={handleNotifySubmit} className="max-w-md mx-auto">
                                        <div className="flex gap-3">
                                            <Input
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="flex-1"
                                            />
                                            <Button
                                                type="submit"
                                                className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-6"
                                            >
                                                <Bell className="w-4 h-4 mr-2" />
                                                Notify Me
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Alternative Actions */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            In the Meantime
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                <CardContent className="p-6 text-center">
                                    <Wrench className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                        Check Our Status Page
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                        Get real-time updates on our maintenance progress
                                    </p>
                                    <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                        View Status
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                <CardContent className="p-6 text-center">
                                    <Mail className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                        Contact Support
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                        Have urgent questions? Our support team is still available
                                    </p>
                                    <Link href="/contact">
                                        <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                            Get Help
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Social Media */}
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                        <CardContent className="p-6">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Follow Us for Updates
                            </h4>
                            <div className="flex justify-center space-x-6">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    >
                                        <div className="text-center">
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs">{social.handle}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        <p>© 2025 MicroTravel. We appreciate your patience during this maintenance window.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}