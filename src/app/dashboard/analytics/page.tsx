/* eslint-disable react-hooks/exhaustive-deps */
'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Eye, Heart, TrendingUp, Calendar, Filter, Download, RefreshCw, AlertCircle, LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import ContentArea from '@/components/Dashboard/ContentArea';

// TypeScript interfaces
interface Trip {
    id: string;
    title: string;
    view_count: number;
}

interface CategoryView {
    category_id: string;
    category_name: string;
    view_count: number;
}

interface WeeklyView {
    day: string;
    views: number;
}

interface AnalyticsData {
    totalViews: number;
    favoritesCount: number;
    topTrips: Trip[];
    categoryViews: CategoryView[];
    weeklyViews: WeeklyView[];
}

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    trend?: number;
    description?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
}

const AnalyticsPage: React.FC = () => {
    const [topTripsLimit, setTopTripsLimit] = useState<number>(5);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<string>('7d');
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Analytics data state
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        totalViews: 0,
        favoritesCount: 0,
        topTrips: [],
        categoryViews: [],
        weeklyViews: []
    });

    const COLORS: string[] = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

    // Kullanıcı ID'si - gerçek uygulamada auth'dan gelecek
    const userId = user?.id

    // Supabase'den toplam görüntüleme sayısını çek
    const fetchTotalViews = async (): Promise<number> => {
        try {
            const { count, error } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'view_trip');

            if (error) throw error;
            return count || 0;
        } catch (err) {
            console.error('Error fetching total views:', err);
            return 0;
        }
    };

    // Supabase'den favoriler sayısını çek
    const fetchFavoritesCount = async (): Promise<number> => {
        try {
            const { count, error } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('event_type', 'add_favorite');

            if (error) throw error;
            return count || 0;
        } catch (err) {
            console.error('Error fetching favorites count:', err);
            return 0;
        }
    };

    // Supabase'den en çok görüntülenen tripleri çek
    const fetchTopTrips = async (limit: number = 5): Promise<Trip[]> => {
        try {
            const { data, error } = await supabase
                .from('analytics_events')
                .select(`
          trip_id,
          trips!inner(id, title)
        `)
                .eq('user_id', userId)
                .eq('event_type', 'view_trip');

            if (error) throw error;

            // Trip ID'lerine göre grupla ve sayıları hesapla
            const tripCounts: Record<string, Trip> = {};
            data?.forEach((item: any) => {
                const tripId = item.trip_id;
                const tripTitle = item.trips.title;

                if (tripCounts[tripId]) {
                    tripCounts[tripId].view_count++;
                } else {
                    tripCounts[tripId] = {
                        id: tripId,
                        title: tripTitle,
                        view_count: 1
                    };
                }
            });

            // Array'e çevir ve sırala
            const sortedTrips = Object.values(tripCounts)
                .sort((a, b) => b.view_count - a.view_count)
                .slice(0, limit);

            return sortedTrips;
        } catch (err) {
            console.error('Error fetching top trips:', err);
            return [];
        }
    };

    // Supabase'den kategori bazında görüntüleme sayılarını çek
    const fetchCategoryViews = async (): Promise<CategoryView[]> => {
        try {
            const { data, error } = await supabase
                .from('analytics_events')
                .select(`
          trip_id,
          trips!inner(
            id,
            trips_categories!inner(
              categories!inner(
                id,
                category_translations!inner(name)
              )
            )
          )
        `)
                .eq('user_id', userId)
                .eq('event_type', 'view_trip')
                .eq('trips.trips_categories.categories.category_translations.locale', 'en');

            if (error) throw error;

            // Kategori sayılarını hesapla
            const categoryCounts: Record<string, CategoryView> = {};
            data?.forEach((item: any) => {
                item.trips.trips_categories.forEach((tc: any) => {
                    const category = tc.categories;
                    const categoryName = category.category_translations[0]?.name;

                    if (categoryName) {
                        if (categoryCounts[category.id]) {
                            categoryCounts[category.id].view_count++;
                        } else {
                            categoryCounts[category.id] = {
                                category_id: category.id,
                                category_name: categoryName,
                                view_count: 1
                            };
                        }
                    }
                });
            });

            return Object.values(categoryCounts)
                .sort((a, b) => b.view_count - a.view_count);
        } catch (err) {
            console.error('Error fetching category views:', err);
            return [];
        }
    };

    // Haftalık görüntüleme verilerini çek (son 7 gün)
    const fetchWeeklyViews = async (): Promise<WeeklyView[]> => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 6); // Son 7 gün

            const { data, error } = await supabase
                .from('analytics_events')
                .select('created_at')
                .eq('user_id', userId)
                .eq('event_type', 'view_trip')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (error) throw error;

            // Günlere göre grupla
            const dailyCounts: Record<string, number> = {};
            const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

            // Son 7 günü başlat
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayName = days[date.getDay()];
                dailyCounts[dayName] = 0;
            }

            // Verileri say
            data?.forEach((item: any) => {
                const date = new Date(item.created_at);
                const dayName = days[date.getDay()];
                if (dailyCounts.hasOwnProperty(dayName)) {
                    dailyCounts[dayName]++;
                }
            });

            return Object.entries(dailyCounts).map(([day, views]) => ({
                day,
                views
            }));
        } catch (err) {
            console.error('Error fetching weekly views:', err);
            return [];
        }
    };

    // Tüm analytics verilerini çek
    const fetchAllAnalytics = async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const [totalViews, favoritesCount, topTrips, categoryViews, weeklyViews] = await Promise.all([
                fetchTotalViews(),
                fetchFavoritesCount(),
                fetchTopTrips(topTripsLimit),
                fetchCategoryViews(),
                fetchWeeklyViews()
            ]);

            setAnalyticsData({
                totalViews,
                favoritesCount,
                topTrips,
                categoryViews,
                weeklyViews
            });
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Component mount edildiğinde ve limit değiştiğinde veri çek
    useEffect(() => {
        fetchAllAnalytics();
    }, [topTripsLimit]);

    const handleRefresh = (): void => {
        fetchAllAnalytics();
    };

    const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setDateRange(e.target.value);
        // Burada dateRange'e göre veri filtreleme yapılabilir
    };

    const handleTopTripsLimitChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setTopTripsLimit(Number(e.target.value));
    };

    const StatCard: React.FC<StatCardProps> = ({
        title,
        value,
        icon: Icon,
        trend,
        description,
        color = "blue"
    }) => {
        const colorClasses = {
            blue: "from-blue-500 to-blue-600",
            green: "from-green-500 to-green-600",
            purple: "from-purple-500 to-purple-600",
            orange: "from-orange-500 to-orange-600"
        };

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
                        {trend && (
                            <p className="text-sm text-green-600 flex items-center mt-2">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                +{trend}% bu hafta
                            </p>
                        )}
                        {description && (
                            <p className="text-xs text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center space-x-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="text-gray-600">Analytics verileri yükleniyor...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Tekrar Dene
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ContentArea>
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                            <p className="text-gray-600">Trip görüntüleme ve etkileşim istatistikleriniz</p>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                            <select
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="7d">Son 7 gün</option>
                                <option value="30d">Son 30 gün</option>
                                <option value="90d">Son 90 gün</option>
                            </select>
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Yenile
                            </button>
                            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                                <Download className="w-4 h-4 mr-2" />
                                Dışa Aktar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Toplam Görüntüleme"
                        value={analyticsData.totalViews}
                        icon={Eye}
                        description="Trip görüntüleme sayısı"
                        color="blue"
                    />
                    <StatCard
                        title="Favoriler"
                        value={analyticsData.favoritesCount}
                        icon={Heart}
                        description="Favorilere eklenen tripler"
                        color="green"
                    />
                    <StatCard
                        title="Ortalama Günlük"
                        value={Math.round(analyticsData.totalViews / 30)}
                        icon={TrendingUp}
                        description="Günlük ortalama görüntüleme"
                        color="purple"
                    />
                    <StatCard
                        title="Popüler Kategoriler"
                        value={analyticsData.categoryViews.length}
                        icon={Filter}
                        description="Görüntülenen kategori sayısı"
                        color="orange"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Haftalık Görüntüleme Trendi */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Haftalık Görüntüleme Trendi</h3>
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        {analyticsData.weeklyViews.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={analyticsData.weeklyViews}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <p>Henüz haftalık veri bulunmuyor</p>
                            </div>
                        )}
                    </div>

                    {/* Kategori Dağılımı */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Kategori Bazında Görüntüleme</h3>
                            <Filter className="w-5 h-5 text-gray-400" />
                        </div>
                        {analyticsData.categoryViews.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analyticsData.categoryViews}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ category_name, percent }: any) => `${category_name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="view_count"
                                    >
                                        {analyticsData.categoryViews.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <p>Henüz kategori verisi bulunmuyor</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* En Çok Görüntülenen Tripler */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">En Çok Görüntülenen Tripler</h3>
                        <div className="flex items-center space-x-3">
                            <label className="text-sm text-gray-600">Göster:</label>
                            <select
                                value={topTripsLimit}
                                onChange={handleTopTripsLimitChange}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={5}>Top 5</option>
                                <option value={10}>Top 10</option>
                            </select>
                        </div>
                    </div>

                    {analyticsData.topTrips.length > 0 ? (
                        <>
                            <div className="mb-6">
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={analyticsData.topTrips} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="title"
                                            stroke="#6B7280"
                                            fontSize={12}
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                        />
                                        <YAxis stroke="#6B7280" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Bar
                                            dataKey="view_count"
                                            fill="#3B82F6"
                                            radius={[4, 4, 0, 0]}
                                            name="Görüntüleme"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Trip Listesi */}
                            <div className="space-y-3">
                                {analyticsData.topTrips.map((trip, index) => (
                                    <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{trip.title}</h4>
                                                <p className="text-sm text-gray-500">Trip ID: {trip.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-gray-900">{trip.view_count}</p>
                                            <p className="text-sm text-gray-500">görüntüleme</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <p>Henüz trip görüntüleme verisi bulunmuyor</p>
                        </div>
                    )}
                </div>
            </div>
        </ContentArea>
    );
};

export default AnalyticsPage;