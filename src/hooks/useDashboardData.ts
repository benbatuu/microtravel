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
        if (!user?.id) return;

        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Total Trips
                const { count: totalTrips, error: tripsError } = await supabase
                    .from('trips')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (tripsError) throw tripsError;

                // 2. Favorite Places
                const { count: favoriteCount, error: favoritesError } = await supabase
                    .from('favorites')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (favoritesError) throw favoritesError;

                // 3. Countries Visited
                const { data: countryData, error: countryError } = await supabase
                    .from('trips')
                    .select('country')
                    .eq('user_id', user.id);

                if (countryError) throw countryError;

                const countriesVisited = new Set(
                    countryData?.map((trip: { country: any; }) => trip.country).filter(Boolean) || []
                ).size;

                // 4. Upcoming Trips
                const { count: upcomingTrips, error: upcomingError } = await supabase
                    .from('trips')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('date', new Date().toISOString().split('T')[0]);

                if (upcomingError) throw upcomingError;

                const statsData: DashboardStat[] = [
                    {
                        title: "Total Trips",
                        value: totalTrips || 0,
                        icon: "Plane",
                        color: "text-blue-600"
                    },
                    {
                        title: "Favorite Places",
                        value: favoriteCount || 0,
                        icon: "Star",
                        color: "text-yellow-500"
                    },
                    {
                        title: "Countries Visited",
                        value: countriesVisited || 0,
                        icon: "Globe",
                        color: "text-green-600"
                    },
                    {
                        title: "Upcoming Trips",
                        value: upcomingTrips || 0,
                        icon: "Calendar",
                        color: "text-purple-600"
                    },
                ];

                setStats(statsData);
            } catch (err) {
                console.error('Error fetching stats:', err);
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
        if (!user?.id) return;

        const fetchRecentActivity = async () => {
            try {
                setLoading(true);
                setError(null);

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

                if (activityError) throw activityError;

                setActivities(
                    (data || []).map((item: any) => ({
                        ...item,
                        trips: item.trips
                            ? Array.isArray(item.trips)
                                ? item.trips[0] // take the first trip if it's an array
                                : item.trips
                            : undefined
                    }))
                );
            } catch (err) {
                console.error('Error fetching recent activity:', err);
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

                // En çok ziyaret edilen ülkelere göre öneri
                const { data, error: recommendationError } = await supabase
                    .from('trips')
                    .select('country, destination, image_url')
                    .not('country', 'is', null)
                    .limit(100);

                if (recommendationError) throw recommendationError;

                // Ülkeleri grupla ve say
                const countryStats: Record<string, {
                    count: number;
                    destinations: Array<{ destination: string; image_url: string | null }>;
                }> = {};

                data?.forEach((trip: { country: string | number; destination: string; image_url: any; }) => {
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

                // En popüler 3 ülkeyi al
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
            } catch (err) {
                console.error('Error fetching recommendations:', err);
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