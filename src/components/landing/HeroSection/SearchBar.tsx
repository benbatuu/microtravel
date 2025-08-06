"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/contexts/I18nContext";

interface SearchBarProps {
    onSearch?: (query: string) => void;
    className?: string;
}

export function SearchBar({ onSearch, className = "" }: SearchBarProps) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = async () => {
        if (!search.trim()) return;

        setIsSearching(true);

        // Track search analytics
        const { Analytics } = await import('@/lib/analytics');
        Analytics.trackSearch(search, 'hero_search');

        setTimeout(() => {
            setIsSearching(false);
            onSearch?.(search);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={`max-w-2xl mx-auto space-y-4 ${className}`}>
            {/* Main Search Bar */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative flex items-center bg-card/80 backdrop-blur-lg rounded-2xl border border-border/50 p-2 shadow-lg hover-lift">
                    <Input
                        type="text"
                        placeholder={t('hero.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 border-0 bg-transparent text-base sm:text-lg placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                    />
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        variant="ghost"
                        size="sm"
                        className="mr-2 text-muted-foreground hover:text-primary p-2"
                        aria-label="Toggle filters"
                    >
                        <Filter className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={handleSearch}
                        disabled={isSearching || !search.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 sm:px-6 py-3 shadow-sm hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSearching ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Search className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 p-4 sm:p-6 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Arama Filtrelerini Özelleştir
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Bütçe
                            </label>
                            <select className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">Tüm bütçeler</option>
                                <option value="500-1000">₺500 - ₺1000</option>
                                <option value="1000-2000">₺1000 - ₺2000</option>
                                <option value="2000+">₺2000+</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Süre
                            </label>
                            <select className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">Tüm süreler</option>
                                <option value="1">1 Gün</option>
                                <option value="2-3">2-3 Gün</option>
                                <option value="4+">4+ Gün</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Tür
                            </label>
                            <select className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">Tüm türler</option>
                                <option value="nature">Doğa</option>
                                <option value="culture">Kültür</option>
                                <option value="adventure">Macera</option>
                                <option value="relaxation">Rahatlama</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(false)}
                            className="flex-1 sm:flex-none"
                        >
                            Filtreleri Uygula
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                // Reset filters logic here
                                setShowFilters(false);
                            }}
                            className="flex-1 sm:flex-none text-gray-600 hover:text-gray-800"
                        >
                            Temizle
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}