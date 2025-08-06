"use client";

import { MapPin, Star, Calendar, Clock, DollarSign, Users, Plane, Shield, Globe, Coins } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useTranslation } from '@/contexts/I18nContext';

interface DestinationCardProps {
    name: string;
    country: string;
    rating: number;
    trips: number;
    image: string;
    // Yeni özellikler
    duration?: number;
    budget?: { amount: number; currency: string };
    category?: string;
    difficultyLevel?: string;
    season?: string;
    groupSize?: number;
    transportation?: string[];
    visaRequirements?: string;
    localCustoms?: any;
    languageInfo?: any;
    currencyInfo?: any;
    className?: string;
    style?: React.CSSProperties;
}

export function DestinationCard({
    name,
    country,
    rating,
    trips,
    image,
    duration,
    budget,
    category,
    difficultyLevel,
    season,
    groupSize,
    transportation,
    visaRequirements,
    localCustoms,
    languageInfo,
    currencyInfo,
    className = "",
    style
}: DestinationCardProps) {
    const { t } = useTranslation();

    const getDifficultyColor = (level?: string) => {
        switch (level) {
            case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'challenging': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'extreme': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';
        }
    };

    const getSeasonColor = (season?: string) => {
        switch (season) {
            case 'spring': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'summer': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'autumn': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'winter': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'year_round': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';
        }
    };

    return (
        <Card
            className={`group rounded-xl overflow-hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${className}`}
            style={style}
        >
            <div className="relative overflow-hidden rounded-xl">
                <Image
                    src={image}
                    alt={name}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    width={400}
                    height={220}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{rating}</span>
                </div>

                {/* Category Badge */}
                {category && (
                    <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm">
                            {category}
                        </Badge>
                    </div>
                )}

                {/* Difficulty Level Badge */}
                {difficultyLevel && (
                    <div className="absolute bottom-4 left-4">
                        <Badge className={getDifficultyColor(difficultyLevel)}>
                            {difficultyLevel}
                        </Badge>
                    </div>
                )}

                {/* Season Badge */}
                {season && (
                    <div className="absolute bottom-4 right-4">
                        <Badge className={getSeasonColor(season)}>
                            {season}
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{name}</h3>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-3">{country}</p>

                {/* Trip Count */}
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{trips.toLocaleString()} trips</span>
                </div>

                {/* Duration */}
                {duration && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                        <Clock className="w-4 h-4" />
                        <span>{duration} {t('destinations.features.duration')}</span>
                    </div>
                )}

                {/* Budget */}
                {budget && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span>{t('destinations.features.budget')}: {budget.currency} {budget.amount.toLocaleString()}</span>
                    </div>
                )}

                {/* Group Size */}
                {groupSize && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                        <Users className="w-4 h-4" />
                        <span>{t('destinations.features.groupSize')}: {groupSize} {t('destinations.features.people')}</span>
                    </div>
                )}

                {/* Transportation */}
                {transportation && transportation.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                        <Plane className="w-4 h-4" />
                        <span>{t('destinations.features.transportation')}: {transportation.slice(0, 2).join(', ')}</span>
                    </div>
                )}

                {/* Visa Requirements */}
                {visaRequirements && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                        <Shield className="w-4 h-4" />
                        <span>{t('destinations.features.visa')}: {visaRequirements}</span>
                    </div>
                )}

                {/* Language Info */}
                {languageInfo && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                        <Globe className="w-4 h-4" />
                        <span>{t('destinations.features.language')}: {languageInfo.primary || 'English'}</span>
                    </div>
                )}

                {/* Currency Info */}
                {currencyInfo && (
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                        <Coins className="w-4 h-4" />
                        <span>{t('destinations.features.currency')}: {currencyInfo.code || 'USD'}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-6 pt-0">
                <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-neutral-600 to-neutral-400 hover:from-neutral-700 hover:to-neutral-500 text-white border-0 shadow-lg transform transition-all hover:scale-105"
                >
                    {t('destinations.viewDetails')}
                </Button>
            </CardFooter>
        </Card>
    );
} 