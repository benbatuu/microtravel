// components/Dashboard/DashboardOverview.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Star, Globe, Calendar, TrendingUp, Plus } from "lucide-react";
import Image from "next/image";
import ContentArea, { ResponsiveGrid, DashboardCard } from "@/components/Dashboard/ContentArea";
import SubscriptionStatus from "@/components/Dashboard/SubscriptionStatus";
import FeatureGate from "@/components/Dashboard/FeatureGate";
import { useAuth } from "@/contexts/AuthContext";
import TripModal from "@/components/TripModal";
import {
    useDashboardStats,
    useRecentActivity,
    useRecommendations,
    type DashboardStat
} from "@/hooks/useDashboardData";

// Icon mapping for TypeScript safety
const iconMap = {
    Plane,
    Star,
    Globe,
    Calendar
} as const;

// Loading skeleton component
const StatsLoadingSkeleton: React.FC = () => (
    <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-24 p-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
            </div>
        ))}
    </ResponsiveGrid>
);

const RecommendationsSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64">
                    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-4">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-full mb-4"></div>
                        <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ActivitiesSkeleton: React.FC = () => (
    <div className="space-y-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
        ))}
    </div>
);

// Helper function for activity descriptions
const getActivityDescription = (eventType: string, destination?: string): string => {
    switch (eventType) {
        case 'trip_created':
            return destination ? `Added new experience in ${destination}` : 'Added new experience';
        case 'trip_updated':
            return destination ? `Updated experience in ${destination}` : 'Updated experience';
        case 'favorite_added':
            return destination ? `Added ${destination} to favorites` : 'Added to favorites';
        default:
            return eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
};

// Format timestamp helper
const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
        return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else {
        return date.toLocaleDateString();
    }
};

const DashboardOverview: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { profile } = useAuth();

    // Supabase'den veri çekme hooks
    const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
    const { activities, loading: activitiesLoading } = useRecentActivity();
    const { recommendations, loading: recommendationsLoading } = useRecommendations();

    const openTripModal = (): void => {
        setIsModalOpen(true);
    };

    // Loading state
    if (statsLoading) {
        return (
            <ContentArea>
                <div className="space-y-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <StatsLoadingSkeleton />
                </div>
            </ContentArea>
        );
    }

    // Error state
    if (statsError) {
        return (
            <ContentArea>
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">Error loading dashboard: {statsError}</p>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </ContentArea>
        );
    }

    return (
        <ContentArea>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Welcome back, {profile?.full_name || 'Traveler'}!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here is what is happening with your travel experiences
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                        onClick={openTripModal}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                    </Button>
                </div>

                <TripModal open={isModalOpen} onOpenChange={setIsModalOpen} />

                {/* Dynamic Stats Grid */}
                <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
                    {stats.map((stat: DashboardStat, idx: number) => {
                        const Icon = iconMap[stat.icon];
                        return (
                            <DashboardCard key={`${stat.title}-${idx}`} className="hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl font-bold mt-1">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Updated now
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </DashboardCard>
                        );
                    })}
                </ResponsiveGrid>

                {/* Quick Actions */}
                <DashboardCard
                    title="Quick Actions"
                    description="Get started with these common tasks"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button
                            variant="outline"
                            className="h-auto p-4 flex-col gap-2 min-h-[80px] touch-manipulation"
                            onClick={openTripModal}
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-sm">New Trip</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto p-4 flex-col gap-2 min-h-[80px] touch-manipulation"
                        >
                            <Star className="w-5 h-5" />
                            <span className="text-sm">Add Favorite</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto p-4 flex-col gap-2 min-h-[80px] touch-manipulation"
                        >
                            <Globe className="w-5 h-5" />
                            <span className="text-sm">Explore</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto p-4 flex-col gap-2 min-h-[80px] touch-manipulation"
                        >
                            <Calendar className="w-5 h-5" />
                            <span className="text-sm">Plan Trip</span>
                        </Button>
                    </div>
                </DashboardCard>

                {/* Dynamic Travel Recommendations */}
                <DashboardCard
                    title="Recommended Destinations"
                    description="Discover popular places based on community data"
                >
                    {recommendationsLoading ? (
                        <RecommendationsSkeleton />
                    ) : recommendations.length > 0 ? (
                        <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
                            {recommendations.map((place, idx) => (
                                <Card
                                    key={`${place.country}-${idx}`}
                                    className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                                >
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <Image
                                            src={place.image}
                                            alt={place.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{place.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {place.description}
                                        </p>
                                        <Button
                                            size="sm"
                                            className="w-full min-h-[44px] touch-manipulation"
                                        >
                                            Explore
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </ResponsiveGrid>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No recommendations available yet. Add some trips to get personalized suggestions!
                            </p>
                        </div>
                    )}
                </DashboardCard>

                {/* Subscription Status and Recent Activity */}
                <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
                    {/* Subscription Status */}
                    <SubscriptionStatus />

                    {/* Dynamic Recent Activity */}
                    <DashboardCard
                        title="Recent Activity"
                        description="Your latest travel experiences"
                    >
                        {activitiesLoading ? (
                            <ActivitiesSkeleton />
                        ) : activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.slice(0, 3).map((activity, idx) => (
                                    <div
                                        key={`${activity.id}-${idx}`}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Plane className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {getActivityDescription(activity.event_type, activity.trips?.destination)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatTimestamp(activity.event_timestamp)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="min-h-[44px] touch-manipulation"
                                        >
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    No recent activity. Start by adding your first trip!
                                </p>
                                <Button
                                    onClick={openTripModal}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    Add Your First Trip
                                </Button>
                            </div>
                        )}
                    </DashboardCard>
                </ResponsiveGrid>

                {/* Premium Features Section */}
                <DashboardCard
                    title="Premium Features"
                    description="Unlock advanced capabilities with a subscription"
                >
                    <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
                        <FeatureGate feature="advanced_analytics">
                            <DashboardCard title="Advanced Analytics" className="border-green-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Get detailed insights about your travel patterns and preferences.
                                </p>
                                <Button className="w-full">View Analytics</Button>
                            </DashboardCard>
                        </FeatureGate>

                        <FeatureGate feature="export_data">
                            <DashboardCard title="Export Data" className="border-blue-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Export your travel experiences in various formats.
                                </p>
                                <Button className="w-full">Export Data</Button>
                            </DashboardCard>
                        </FeatureGate>

                        <FeatureGate feature="collaboration">
                            <DashboardCard title="Collaboration" className="border-purple-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Share and collaborate on travel experiences with others.
                                </p>
                                <Button className="w-full">Start Collaborating</Button>
                            </DashboardCard>
                        </FeatureGate>
                    </ResponsiveGrid>
                </DashboardCard>
            </div>
        </ContentArea>
    );
};

export default DashboardOverview;