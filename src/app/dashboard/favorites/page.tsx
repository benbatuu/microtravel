"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, HeartOff, Calendar, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import ContentArea from "@/components/Dashboard/ContentArea";

type Trip = {
    id: string;
    title: string;
    date: string;
    country: string;
    category?: string;
    note?: string;
    image_url?: string;
};

type FavoriteData = {
    trip_id: string;
    trips: Trip | null;
};

export default function FavoritesPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [favoriteTrips, setFavoriteTrips] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    // Favori verilerini almak için
    const fetchFavorites = async () => {
        setLoading(true);
        setError(null);

        try {
            // Oturum açmış kullanıcıyı kontrol et
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                throw new Error(`Kullanıcı bilgileri alınamadı: ${userError.message}`);
            }

            if (!user) {
                throw new Error("Oturum açmış kullanıcı bulunamadı");
            }

            console.log("Kullanıcı ID:", user.id);

            // Favorileri çek
            const { data, error } = await supabase
                .from("favorites")
                .select(`
                    trip_id,
                    trips (
                        id,
                        title,
                        date,
                        country,
                        category,
                        note,
                        image_url
                    )
                `)
                .eq("user_id", user.id);

            if (error) {
                throw new Error(`Favoriler alınamadı: ${error.message}`);
            }

            console.log("Gelen veri:", data);

            if (!data || data.length === 0) {
                setTrips([]);
                setFavoriteTrips(new Set());
                return;
            }

            // Veriyi doğru şekilde işle ve tekrarları kaldır
            const favoriteData = data as unknown as FavoriteData[];
            const uniqueTrips = new Map<string, Trip>();

            favoriteData.forEach((fav) => {
                if (fav.trips) {
                    uniqueTrips.set(fav.trips.id, fav.trips);
                }
            });

            const tripsArray = Array.from(uniqueTrips.values());
            console.log("İşlenmiş veri:", tripsArray);

            setTrips(tripsArray);
            setFavoriteTrips(new Set(tripsArray.map((trip) => trip.id)));
        } catch (err) {
            console.error("Hata:", err);
            setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    // Favoriden çıkar
    const removeFromFavorites = async (tripId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from("favorites")
                .delete()
                .eq("user_id", user.id)
                .eq("trip_id", tripId);

            if (error) {
                console.error("Favori çıkarma işlemi başarısız:", error.message);
                return;
            }

            // State'i güncelle
            setTrips(prev => prev.filter(trip => trip.id !== tripId));
            setFavoriteTrips(prev => {
                const newFavorites = new Set(prev);
                newFavorites.delete(tripId);
                return newFavorites;
            });
        } catch (err) {
            console.error("Favori çıkarma hatası:", err);
        }
    };

    const filteredTrips = trips.filter((trip) => {
        const matchesSearch =
            trip.title.toLowerCase().includes(search.toLowerCase()) ||
            trip.country.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            categoryFilter === "all" || trip.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const uniqueCategories = Array.from(new Set(trips.map((t) => t.category).filter(Boolean)));

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <ContentArea>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Favori Deneyimlerim</h1>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-md">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Yükleniyor...</span>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Ara (başlık / şehir)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    {uniqueCategories.map((cat) => (
                                        <SelectItem key={cat} value={cat!}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {filteredTrips.length === 0 ? (
                            <div className="text-center py-12">
                                <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">
                                    {trips.length === 0
                                        ? "Henüz favori eklemediniz."
                                        : "Filtreye uyan sonuç bulunamadı."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTrips.map((trip) => (
                                    <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                        <div className="relative">
                                            {trip.image_url && (
                                                <div className="relative h-48 w-full">
                                                    <Image
                                                        src={trip.image_url}
                                                        alt={trip.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => removeFromFavorites(trip.id)}
                                                className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors duration-200"
                                                title="Favorilerden çıkar"
                                            >
                                                <Heart className="h-5 w-5 text-red-500 fill-current" />
                                            </button>
                                        </div>

                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{trip.title}</CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                {trip.country}
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                {formatDate(trip.date)}
                                            </div>

                                            {trip.category && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Tag className="h-4 w-4 mr-2" />
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                        {trip.category}
                                                    </span>
                                                </div>
                                            )}

                                            {trip.note && (
                                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                                    <p className="line-clamp-3">{trip.note}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {filteredTrips.length > 0 && (
                            <div className="text-center text-sm text-gray-500 pt-4">
                                {filteredTrips.length} favori deneyim gösteriliyor
                            </div>
                        )}
                    </>
                )}
            </div>
        </ContentArea>
    );
}