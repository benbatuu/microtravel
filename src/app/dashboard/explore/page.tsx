/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Star, Crown, Globe, Heart, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import ContentArea, { ResponsiveGrid, DashboardCard } from '@/components/Dashboard/ContentArea';
import FeatureGate, { UpgradePrompt } from '@/components/Dashboard/FeatureGate';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    trip_count: number;
}

interface Trip {
    id: string;
    title: string;
    note: string;
    date: string;
    country: string;
    image_url: string;
    budget: number;
    accommodation: string;
    activities: string;
    map_location: string;
    companions: string;
    rating: number;
    created_at: string;
    updated_at: string;
    user_id: string;
    author: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
    categories: Category[];
    favorites?: { user_id: string }[];
    _count?: { favorites: number };
}

export default function ExplorePage() {
    const { user, isSubscribed } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTab, setSelectedTab] = useState('featured');
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const currentLocale = "en";

    // 1) Kategorileri dile göre çek
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select(`
                        id,
                        category_translations!inner (
                            name
                        ),
                        trips_categories (
                            trip_id
                        )
                    `)
                    .eq('category_translations.locale', currentLocale);

                if (error) {
                    throw error;
                }

                // Kategorileri ve trip sayılarını hesapla
                const processedCategories = (data || []).map((cat: any) => ({
                    id: cat.id,
                    name: cat.category_translations[0]?.name || 'Unknown',
                    trip_count: cat.trips_categories?.length || 0
                }));

                // Toplam trip sayısını hesapla
                const totalTripCount = processedCategories.reduce((sum, cat) => sum + cat.trip_count, 0);

                // "All" kategorisini ekle
                setCategories([
                    { id: 'all', name: 'All', trip_count: totalTripCount },
                    ...processedCategories
                ]);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, [currentLocale]);

    // 2) Tripleri çek (tüm trips veya kategoriye göre filtrelenmiş)
    useEffect(() => {
        const fetchTrips = async () => {
            setLoading(true);
            try {
                let query;
                let orderColumn = 'created_at';
                let ascending = false;

                // Tab'a göre sıralama belirle
                switch (selectedTab) {
                    case 'recent':
                        orderColumn = 'date';
                        ascending = false;
                        break;
                    case 'popular':
                        orderColumn = 'rating';
                        ascending = false;
                        break;
                    default: // featured
                        orderColumn = 'created_at';
                        ascending = false;
                        break;
                }

                if (selectedCategory === 'all') {
                    // Tüm tripleri çek
                    query = supabase
                        .from('trips')
                        .select(`
                            id,
                            title,
                            date,
                            country,
                            note,
                            image_url,
                            budget,
                            accommodation,
                            activities,
                            map_location,
                            companions,
                            rating,
                            created_at,
                            updated_at,
                            user_id,
                            author:profiles!trips_user_id_fkey(id, full_name, avatar_url),
                            favorites(user_id),
                            trips_categories(
                                category:categories!inner(
                                    id,
                                    category_translations!inner(name)
                                )
                            )
                        `)
                        .eq('trips_categories.category.category_translations.locale', currentLocale);
                } else {
                    // Belirli kategoriye ait tripleri çek
                    query = supabase
                        .from('trips')
                        .select(`
                            id,
                            title,
                            date,
                            country,
                            note,
                            image_url,
                            budget,
                            accommodation,
                            activities,
                            map_location,
                            companions,
                            rating,
                            created_at,
                            updated_at,
                            user_id,
                            author:profiles!trips_user_id_fkey(id, full_name, avatar_url),
                            favorites(user_id),
                            trips_categories!inner(
                                category:categories!inner(
                                    id,
                                    category_translations!inner(name)
                                )
                            )
                        `)
                        .eq('trips_categories.category_id', selectedCategory)
                        .eq('trips_categories.category.category_translations.locale', currentLocale);
                }

                // Arama sorgusu varsa filtrele
                if (searchQuery.trim()) {
                    query = query.or(`title.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%,note.ilike.%${searchQuery}%`);
                }

                // Sırala ve limitele
                query = query
                    .order(orderColumn, { ascending })
                    .limit(50);

                const { data, error } = await query;

                if (error) {
                    throw error;
                }

                // Veriyi işle
                const processedTrips = (data || []).map((trip: any) => {
                    const categories = (trip.trips_categories || []).map((tc: any) => ({
                        id: tc.category.id,
                        name: tc.category.category_translations[0]?.name || 'Unknown',
                        trip_count: 0
                    }));

                    const favorites = (trip.favorites || []).map((fav: any) => ({ user_id: fav.user_id }));

                    return {
                        ...trip,
                        categories,
                        favorites,
                        _count: { favorites: favorites.length }
                    };
                });

                setTrips(processedTrips);
            } catch (error) {
                console.error('Error fetching trips:', error);
                toast.error('Failed to load trips');
            } finally {
                setLoading(false);
            }
        };

        if (categories.length > 0) {
            fetchTrips();
        }
    }, [selectedTab, selectedCategory, searchQuery, currentLocale, categories]);

    const toggleFavorite = async (tripId: string) => {
        if (!user) {
            toast.error('Please sign in to add favorites');
            return;
        }

        try {
            const trip = trips.find(t => t.id === tripId);
            const isFavorited = trip?.favorites?.some(fav => fav.user_id === user.id);

            if (isFavorited) {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('trip_id', tripId);

                if (error) {
                    throw error;
                }
                toast.success('Removed from favorites');
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .insert({ user_id: user.id, trip_id: tripId });

                if (error) {
                    throw error;
                }
                toast.success('Added to favorites');
            }

            setTrips(prev => prev.map(trip => {
                if (trip.id === tripId) {
                    const updatedFavorites = isFavorited
                        ? trip.favorites?.filter(fav => fav.user_id !== user.id) || []
                        : [...(trip.favorites || []), { user_id: user.id }];

                    return {
                        ...trip,
                        favorites: updatedFavorites,
                        _count: { favorites: updatedFavorites.length }
                    };
                }
                return trip;
            }));
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Failed to update favorite');
        }
    };

    const openTripModal = (trip: Trip) => {
        setSelectedTrip(trip);
        setModalOpen(true);
    };

    return (
        <ContentArea>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Explore Trips
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Discover amazing travel experiences from our community
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search destinations, trips..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <FeatureGate
                        feature="advanced_search"
                        fallback={
                            <Button variant="outline" disabled className="min-h-[44px]">
                                <Filter className="w-4 h-4 mr-2" />
                                Advanced Filters (Premium)
                            </Button>
                        }
                    >
                        <Button variant="outline" className="min-h-[44px] touch-manipulation">
                            <Filter className="w-4 h-4 mr-2" />
                            Advanced Filters
                        </Button>
                    </FeatureGate>
                </div>

                {/* Categories - Sağa Sola Kaydırılabilir */}
                <div className="flex flex-row overflow-x-auto whitespace-nowrap space-x-2 pb-2 scrollbar-hide">
                    {categoriesLoading ? (
                        // Loading skeleton
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="min-w-[120px] h-10 bg-muted animate-pulse rounded-md flex-shrink-0" />
                        ))
                    ) : (
                        categories.map((category) => {
                            const isSelected = selectedCategory === category.id;
                            return (
                                <Button
                                    key={category.id}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(category.id)}
                                    className="min-h-[44px] touch-manipulation flex-shrink-0 whitespace-nowrap"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    {category.name} ({category.trip_count})
                                </Button>
                            );
                        })
                    )}
                </div>

                {/* Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="featured">Featured</TabsTrigger>
                        <TabsTrigger value="recent">Recent</TabsTrigger>
                        <TabsTrigger value="popular">Popular</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedTab} className="space-y-6">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <Card key={i} className="overflow-hidden">
                                        <div className="h-48 bg-muted animate-pulse" />
                                        <CardHeader>
                                            <div className="h-4 bg-muted animate-pulse rounded" />
                                            <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-muted animate-pulse rounded" />
                                                <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : trips.length > 0 ? (
                            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
                                {trips.map((trip) => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        canView={isSubscribed}
                                        onToggleFavorite={toggleFavorite}
                                        onViewDetails={openTripModal}
                                        isFavorited={user ? trip.favorites?.some(fav => fav.user_id === user.id) || false : false}
                                    />
                                ))}
                            </ResponsiveGrid>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    {searchQuery || selectedCategory !== 'all'
                                        ? 'No trips found matching your criteria'
                                        : 'No trips available'
                                    }
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Premium Features */}
                <DashboardCard
                    title="Premium Discovery Features"
                    description="Unlock advanced exploration capabilities"
                >
                    <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
                        <FeatureGate feature="advanced_search">
                            <DashboardCard title="Advanced Search" className="border-blue-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Filter by budget, duration, difficulty, and more advanced criteria.
                                </p>
                                <Button className="w-full">Use Advanced Search</Button>
                            </DashboardCard>
                        </FeatureGate>

                        <FeatureGate feature="collaboration">
                            <DashboardCard title="Connect with Travelers" className="border-green-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Message other travelers and plan trips together.
                                </p>
                                <Button className="w-full">Start Connecting</Button>
                            </DashboardCard>
                        </FeatureGate>

                        <FeatureGate feature="export_data">
                            <DashboardCard title="Save Collections" className="border-purple-200">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Create and export custom collections of experiences.
                                </p>
                                <Button className="w-full">Create Collection</Button>
                            </DashboardCard>
                        </FeatureGate>
                    </ResponsiveGrid>
                </DashboardCard>
            </div>

            {/* Trip Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedTrip && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                    <span>{selectedTrip.title}</span>
                                    <div className="flex items-center gap-2">
                                        {selectedTrip.categories?.map(cat => (
                                            <Badge key={cat.id} variant="secondary">
                                                {cat.name}
                                            </Badge>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setModalOpen(false)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                                    <Image
                                        src={selectedTrip.image_url}
                                        alt={selectedTrip.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 80vw"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Country</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <span>{selectedTrip.country}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Date</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span>{new Date(selectedTrip.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Rating</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span>{selectedTrip.rating}</span>
                                                <span className="text-muted-foreground">
                                                    ({selectedTrip._count?.favorites || 0} favorites)
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Budget</Label>
                                            <div className="mt-1">
                                                <span>${selectedTrip.budget}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Author</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                {selectedTrip.author.avatar_url && (
                                                    <Image
                                                        src={selectedTrip.author.avatar_url}
                                                        alt={selectedTrip.author.full_name}
                                                        width={24}
                                                        height={24}
                                                        className="rounded-full"
                                                    />
                                                )}
                                                <span>{selectedTrip.author.full_name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Description</Label>
                                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                                {selectedTrip.note}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Accommodation</Label>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {selectedTrip.accommodation}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Activities</Label>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {selectedTrip.activities}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Companions</Label>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {selectedTrip.companions}
                                            </p>
                                        </div>

                                        {selectedTrip.map_location && (
                                            <div>
                                                <Label className="text-sm font-medium">Map Location</Label>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {selectedTrip.map_location}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => toggleFavorite(selectedTrip.id)}
                                        className="flex items-center gap-2"
                                    >
                                        <Heart className={`w-4 h-4 ${user && selectedTrip.favorites?.some(fav => fav.user_id === user.id)
                                            ? 'fill-red-500 text-red-500'
                                            : ''
                                            }`} />
                                        {user && selectedTrip.favorites?.some(fav => fav.user_id === user.id)
                                            ? 'Remove from Favorites'
                                            : 'Add to Favorites'
                                        }
                                    </Button>

                                    <Button className="flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        View Full Trip
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </ContentArea>
    );
}

interface TripCardProps {
    trip: Trip;
    canView: boolean;
    onToggleFavorite: (id: string) => void;
    onViewDetails: (trip: Trip) => void;
    isFavorited: boolean;
}

function TripCard({ trip, canView, onToggleFavorite, onViewDetails, isFavorited }: TripCardProps) {
    if (!canView) {
        return (
            <Card className="overflow-hidden border-dashed">
                <div className="relative h-48 w-full bg-muted">
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <Crown className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-medium">Premium Trip</p>
                        </div>
                    </div>
                    <Image
                        src={trip.image_url}
                        alt={trip.title}
                        fill
                        className="object-cover opacity-50"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{trip.title}</span>
                        <Badge variant="secondary">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <UpgradePrompt
                        feature="advanced_search"
                        variant="inline"
                        className="mb-4"
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <div className="relative h-48 w-full overflow-hidden" onClick={() => onViewDetails(trip)}>
                <Image
                    src={trip.image_url}
                    alt={trip.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(trip.id);
                        }}
                        className="h-8 w-8 p-0"
                    >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                </div>
            </div>

            <CardHeader className="pb-2" onClick={() => onViewDetails(trip)}>
                <CardTitle className="text-lg">{trip.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.country}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{trip.rating}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0" onClick={() => onViewDetails(trip)}>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {trip.note}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                    {trip.categories?.map((cat) => (
                        <Badge key={cat.id} variant="outline" className="text-xs">
                            {cat.name}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        by {trip.author.full_name}
                    </span>
                    <Button
                        size="sm"
                        className="min-h-[36px] touch-manipulation"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(trip);
                        }}
                    >
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}