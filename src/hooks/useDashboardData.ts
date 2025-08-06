/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';


// Types
export interface DashboardStat {
    title: string;
    value: number;
    icon: 'Plane' | 'Star' | 'Globe' | 'Calendar';
    color: string;
}

export interface RecentActivity {
    id: string;
    event_type: string;
    trip_id: string;
    event_timestamp: string;
    metadata: any;
    trips?: {
        title: string;
        destination: string;
    };
}

export interface Recommendation {
    title: string;
    image: string;
    description: string;
    country: string;
}

export interface SubscriptionData {
    is_premium: boolean;
    subscription_end: string | null;
    features: Record<string, any>;
}

// Hook for Dashboard Stats
export const useDashboardStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            // Provide default stats for unauthenticated users
            const defaultStats: DashboardStat[] = [
                {
                    title: "Total Trips",
                    value: 0,
                    icon: "Plane",
                    color: "text-blue-600"
                },
                {
                    title: "Favorite Places",
                    value: 0,
                    icon: "Star",
                    color: "text-yellow-500"
                },
                {
                    title: "Countries Visited",
                    value: 0,
                    icon: "Globe",
                    color: "text-green-600"
                },
                {
                    title: "Upcoming Trips",
                    value: 0,
                    icon: "Calendar",
                    color: "text-purple-600"
                },
            ];
            setStats(defaultStats);
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                let totalTrips = 0;
                let favoriteCount = 0;
                let countriesVisited = 0;
                let upcomingTrips = 0;

                try {
                    // 1. Total Trips - with fallback
                    const { count: tripsCount, error: tripsError } = await supabase
                        .from('trips')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id);

                    if (!tripsError) {
                        totalTrips = tripsCount || 0;
                    }
                } catch (err) {
                    console.warn('Trips table not accessible, using default value:', err);
                }

                try {
                    // 2. Favorite Places - with fallback
                    const { count: favCount, error: favoritesError } = await supabase
                        .from('favorites')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id);

                    if (!favoritesError) {
                        favoriteCount = favCount || 0;
                    }
                } catch (err) {
                    console.warn('Favorites table not accessible, using default value:', err);
                }

                try {
                    // 3. Countries Visited - with fallback
                    const { data: countryData, error: countryError } = await supabase
                        .from('trips')
                        .select('country')
                        .eq('user_id', user.id);

                    if (!countryError && countryData) {
                        countriesVisited = new Set(
                            countryData.map((trip: { country: any; }) => trip.country).filter(Boolean)
                        ).size;
                    }
                } catch (err) {
                    console.warn('Countries data not accessible, using default value:', err);
                }

                try {
                    // 4. Upcoming Trips - with fallback
                    const { count: upcomingCount, error: upcomingError } = await supabase
                        .from('trips')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .gte('date', new Date().toISOString().split('T')[0]);

                    if (!upcomingError) {
                        upcomingTrips = upcomingCount || 0;
                    }
                } catch (err) {
                    console.warn('Upcoming trips data not accessible, using default value:', err);
                }

                const statsData: DashboardStat[] = [
                    {
                        title: "Total Trips",
                        value: totalTrips,
                        icon: "Plane",
                        color: "text-blue-600"
                    },
                    {
                        title: "Favorite Places",
                        value: favoriteCount,
                        icon: "Star",
                        color: "text-yellow-500"
                    },
                    {
                        title: "Countries Visited",
                        value: countriesVisited,
                        icon: "Globe",
                        color: "text-green-600"
                    },
                    {
                        title: "Upcoming Trips",
                        value: upcomingTrips,
                        icon: "Calendar",
                        color: "text-purple-600"
                    },
                ];

                setStats(statsData);
            } catch (err) {
                console.error('Error fetching stats:', err);
                // Provide fallback stats even on error
                const fallbackStats: DashboardStat[] = [
                    {
                        title: "Total Trips",
                        value: 0,
                        icon: "Plane",
                        color: "text-blue-600"
                    },
                    {
                        title: "Favorite Places",
                        value: 0,
                        icon: "Star",
                        color: "text-yellow-500"
                    },
                    {
                        title: "Countries Visited",
                        value: 0,
                        icon: "Globe",
                        color: "text-green-600"
                    },
                    {
                        title: "Upcoming Trips",
                        value: 0,
                        icon: "Calendar",
                        color: "text-purple-600"
                    },
                ];
                setStats(fallbackStats);
                setError(err instanceof Error ? err.message : 'Failed to load statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user?.id]);

    return { stats, loading, error };
};

// Hook for Recent Activity
export const useRecentActivity = () => {
    const { user } = useAuth();
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            setActivities([]);
            setLoading(false);
            return;
        }

        const fetchRecentActivity = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch from analytics_events table with fallback
                try {
                    const { data, error: activityError } = await supabase
                        .from('analytics_events')
                        .select(`
                            id,
                            event_type,
                            trip_id,
                            event_timestamp,
                            metadata,
                            trips (
                              title,
                              destination
                            )
                        `)
                        .eq('user_id', user.id)
                        .order('event_timestamp', { ascending: false })
                        .limit(10);

                    if (!activityError && data) {
                        setActivities(
                            data.map((item: any) => ({
                                ...item,
                                trips: item.trips
                                    ? Array.isArray(item.trips)
                                        ? item.trips[0] // take the first trip if it's an array
                                        : item.trips
                                    : undefined
                            }))
                        );
                    } else {
                        // Fallback: create mock activities based on user's trips
                        const { data: tripsData } = await supabase
                            .from('trips')
                            .select('id, title, destination, created_at')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false })
                            .limit(5);

                        if (tripsData && tripsData.length > 0) {
                            const mockActivities: RecentActivity[] = tripsData.map((trip: any, index: number) => ({
                                id: `mock-${trip.id}-${index}`,
                                event_type: 'trip_created',
                                trip_id: trip.id,
                                event_timestamp: trip.created_at || new Date().toISOString(),
                                metadata: {},
                                trips: {
                                    title: trip.title,
                                    destination: trip.destination
                                }
                            }));
                            setActivities(mockActivities);
                        } else {
                            setActivities([]);
                        }
                    }
                } catch (fallbackError) {
                    console.warn('Analytics events table not accessible, using empty activities:', fallbackError);
                    setActivities([]);
                }
            } catch (err) {
                console.error('Error fetching recent activity:', err);
                setActivities([]);
                setError(err instanceof Error ? err.message : 'Failed to load recent activity');
            } finally {
                setLoading(false);
            }
        };

        fetchRecentActivity();
    }, [user?.id]);

    return { activities, loading, error };
};

// Hook for Recommendations
export const useRecommendations = () => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);

                try {
                    // Try to get recommendations from trips data
                    const { data, error: recommendationError } = await supabase
                        .from('trips')
                        .select('country, destination, image_url')
                        .not('country', 'is', null)
                        .limit(100);

                    if (!recommendationError && data && data.length > 0) {
                        // Group countries and count
                        const countryStats: Record<string, {
                            count: number;
                            destinations: Array<{ destination: string; image_url: string | null }>;
                        }> = {};

                        data.forEach((trip: { country: string | number; destination: string; image_url: any; }) => {
                            if (trip.country) {
                                if (!countryStats[trip.country]) {
                                    countryStats[trip.country] = {
                                        count: 0,
                                        destinations: []
                                    };
                                }
                                countryStats[trip.country].count++;

                                if (trip.destination &&
                                    !countryStats[trip.country].destinations.some(d => d.destination === trip.destination)) {
                                    countryStats[trip.country].destinations.push({
                                        destination: trip.destination,
                                        image_url: trip.image_url
                                    });
                                }
                            }
                        });

                        // Get top 3 countries
                        const topCountries: Recommendation[] = Object.entries(countryStats)
                            .sort(([, a], [, b]) => b.count - a.count)
                            .slice(0, 3)
                            .map(([country, stats]) => ({
                                title: stats.destinations[0]?.destination || country,
                                image: stats.destinations[0]?.image_url ||
                                    `https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=880&auto=format&fit=crop`,
                                description: `Popular destination with ${stats.count} visits from travelers`,
                                country
                            }));

                        setRecommendations(topCountries);
                    } else {
                        // Fallback: provide default popular destinations
                        const defaultRecommendations: Recommendation[] = [
                            {
                                title: "Paris, France",
                                image: "https://images.unsplash.com/photo-1584266337361-679ae80c8519?q=80&w=880&auto=format&fit=crop",
                                description: "The City of Light offers endless micro-adventures from charming cafés to hidden gardens",
                                country: "France"
                            },
                            {
                                title: "Tokyo, Japan",
                                image: "https://images.unsplash.com/photo-1573985525948-591412799467?q=80&w=880&auto=format&fit=crop",
                                description: "Discover traditional temples and modern districts in short, immersive experiences",
                                country: "Japan"
                            },
                            {
                                title: "New York, USA",
                                image: "https://images.unsplash.com/photo-1580752300928-6e1d4ed200c0?q=80&w=880&auto=format&fit=crop",
                                description: "Explore diverse neighborhoods and iconic landmarks in bite-sized adventures",
                                country: "USA"
                            }
                        ];
                        setRecommendations(defaultRecommendations);
                    }
                } catch (fallbackError) {
                    console.warn('Trips table not accessible, using default recommendations:', fallbackError);
                    // Provide default recommendations
                    const defaultRecommendations: Recommendation[] = [
                        {
                            title: "Paris, France",
                            image: "https://images.unsplash.com/photo-1584266337361-679ae80c8519?q=80&w=880&auto=format&fit=crop",
                            description: "The City of Light offers endless micro-adventures from charming cafés to hidden gardens",
                            country: "France"
                        },
                        {
                            title: "Tokyo, Japan",
                            image: "https://images.unsplash.com/photo-1573985525948-591412799467?q=80&w=880&auto=format&fit=crop",
                            description: "Discover traditional temples and modern districts in short, immersive experiences",
                            country: "Japan"
                        },
                        {
                            title: "New York, USA",
                            image: "https://images.unsplash.com/photo-1580752300928-6e1d4ed200c0?q=80&w=880&auto=format&fit=crop",
                            description: "Explore diverse neighborhoods and iconic landmarks in bite-sized adventures",
                            country: "USA"
                        }
                    ];
                    setRecommendations(defaultRecommendations);
                }
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                // Even on error, provide some default recommendations
                const fallbackRecommendations: Recommendation[] = [
                    {
                        title: "Explore Popular Destinations",
                        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=880&auto=format&fit=crop",
                        description: "Discover amazing places for your next micro-adventure",
                        country: "Global"
                    }
                ];
                setRecommendations(fallbackRecommendations);
                setError(err instanceof Error ? err.message : 'Failed to load recommendations');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    return { recommendations, loading, error };
};

// Hook for Subscription Status
export const useSubscriptionStatus = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchSubscription = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error: subscriptionError } = await supabase
                    .from('users')
                    .select('is_premium, subscription_end, features')
                    .eq('id', user.id)
                    .single();

                if (subscriptionError) throw subscriptionError;

                setSubscription(data);
            } catch (err) {
                console.error('Error fetching subscription:', err);
                setError(err instanceof Error ? err.message : 'Failed to load subscription status');
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [user?.id]);

    return { subscription, loading, error };
};

// Hook for Feature Access Check
export const useFeatureAccess = (featureName: string) => {
    const { subscription } = useSubscriptionStatus();

    const hasAccess = subscription?.is_premium &&
        subscription?.features?.[featureName] === true;

    return { hasAccess, isPremium: subscription?.is_premium || false };
};