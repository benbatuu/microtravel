"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Crown,
    Calendar,
    CreditCard,
    ArrowUp,
    ArrowDown,
    Check,
    X,
    AlertTriangle,
    Shield
} from "lucide-react";

interface SubscriptionTier {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    limits: {
        experiences: number | 'unlimited';
        storage: string;
        exports: number | 'unlimited';
    };
    popular?: boolean;
}

const subscriptionTiers: SubscriptionTier[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
            'Basic travel experiences',
            'Community access',
            'Mobile app access',
            'Email support'
        ],
        limits: {
            experiences: 5,
            storage: '50MB',
            exports: 1
        }
    },
    {
        id: 'explorer',
        name: 'Explorer',
        price: 29.99,
        interval: 'month',
        features: [
            'All Free features',
            'Premium experiences',
            'Advanced filters',
            'Priority support',
            'Offline access'
        ],
        limits: {
            experiences: 50,
            storage: '500MB',
            exports: 10
        },
        popular: true
    },
    {
        id: 'traveler',
        name: 'Traveler',
        price: 99.99,
        interval: 'month',
        features: [
            'All Explorer features',
            'Unlimited experiences',
            'Custom itineraries',
            'Concierge support',
            'Early access to new features'
        ],
        limits: {
            experiences: 'unlimited',
            storage: '5GB',
            exports: 'unlimited'
        }
    }
];

const currentSubscription = {
    tier: 'explorer',
    status: 'active',
    currentPeriodEnd: '2025-02-01',
    cancelAtPeriodEnd: false,
    nextBillingAmount: 29.99
};

export default function SubscriptionPage() {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string | null>(null);

    const currentTier = subscriptionTiers.find(tier => tier.id === currentSubscription.tier);

    const handleUpgrade = (tierId: string) => {
        setSelectedTier(tierId);
        // In a real implementation, this would redirect to Stripe checkout
        console.log('Upgrading to:', tierId);
        alert(`Upgrading to ${subscriptionTiers.find(t => t.id === tierId)?.name} plan`);
    };

    const handleDowngrade = (tierId: string) => {
        setSelectedTier(tierId);
        // In a real implementation, this would handle downgrade logic
        console.log('Downgrading to:', tierId);
        alert(`Downgrading to ${subscriptionTiers.find(t => t.id === tierId)?.name} plan`);
    };

    const handleCancelSubscription = () => {
        // In a real implementation, this would call the API to cancel
        console.log('Cancelling subscription');
        setShowCancelDialog(false);
        alert('Subscription cancelled. You will retain access until the end of your billing period.');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Subscription Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Manage your subscription plan and billing preferences
                    </p>
                </div>
            </div>

            {/* Current Subscription Status */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <span>Current Subscription</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {currentTier?.name} Plan
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {formatPrice(currentTier?.price || 0)}/month
                            </p>
                        </div>
                        <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentSubscription.status === 'active'
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                }`}>
                                {currentSubscription.status === 'active' ? (
                                    <Check className="w-4 h-4 mr-1" />
                                ) : (
                                    <X className="w-4 h-4 mr-1" />
                                )}
                                {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Next billing date</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(currentSubscription.currentPeriodEnd)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Next charge</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatPrice(currentSubscription.nextBillingAmount)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Auto-renewal</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {currentSubscription.cancelAtPeriodEnd ? 'Disabled' : 'Enabled'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {currentSubscription.cancelAtPeriodEnd && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Subscription Cancelled
                                    </h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        Your subscription will end on {formatDate(currentSubscription.currentPeriodEnd)}.
                                        You`ll still have access to all features until then.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Usage Overview */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                    <CardTitle>Current Usage</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Experiences</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    12 / {currentTier?.limits.experiences}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                                    style={{ width: '24%' }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Storage</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    120MB / {currentTier?.limits.storage}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                                    style={{ width: '24%' }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Exports</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    3 / {currentTier?.limits.exports}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                                    style={{ width: '30%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Available Plans */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Available Plans
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionTiers.map((tier) => {
                        const isCurrent = tier.id === currentSubscription.tier;
                        const isUpgrade = subscriptionTiers.findIndex(t => t.id === tier.id) >
                            subscriptionTiers.findIndex(t => t.id === currentSubscription.tier);

                        return (
                            <Card
                                key={tier.id}
                                className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl ${tier.popular ? 'ring-2 ring-purple-500' : ''
                                    } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Current Plan
                                        </span>
                                    </div>
                                )}

                                <CardContent className="p-8">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {tier.name}
                                        </h3>
                                        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                                            {formatPrice(tier.price)}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            per {tier.interval}
                                        </p>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {tier.features.map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-300">Experiences</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {tier.limits.experiences}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-300">Storage</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {tier.limits.storage}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-300">Exports</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {tier.limits.exports}
                                            </span>
                                        </div>
                                    </div>

                                    {isCurrent ? (
                                        <Button disabled className="w-full" variant="outline">
                                            <Check className="w-4 h-4 mr-2" />
                                            Current Plan
                                        </Button>
                                    ) : isUpgrade ? (
                                        <Button
                                            onClick={() => handleUpgrade(tier.id)}
                                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                        >
                                            <ArrowUp className="w-4 h-4 mr-2" />
                                            Upgrade to {tier.name}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleDowngrade(tier.id)}
                                            variant="outline"
                                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            <ArrowDown className="w-4 h-4 mr-2" />
                                            Downgrade to {tier.name}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Subscription Actions */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                    <CardTitle>Subscription Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Update Billing Date
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Update Payment Method
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(true)}
                            className="flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Subscription
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Cancel Subscription Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md bg-white dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                <span>Cancel Subscription</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-300">
                                Are you sure you want to cancel your subscription? You`ll lose access to premium features
                                at the end of your current billing period ({formatDate(currentSubscription.currentPeriodEnd)}).
                            </p>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                    What you`ll lose:
                                </h4>
                                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                    <li>• Premium travel experiences</li>
                                    <li>• Advanced filtering options</li>
                                    <li>• Priority customer support</li>
                                    <li>• Offline access to content</li>
                                </ul>
                            </div>

                            <div className="flex space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCancelDialog(false)}
                                    className="flex-1"
                                >
                                    Keep Subscription
                                </Button>
                                <Button
                                    onClick={handleCancelSubscription}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Cancel Subscription
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}