"use client";

import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";

interface PricingTier {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    interval: 'month' | 'year';
    description: string;
    features: string[];
    limitations?: string[];
    popular?: boolean;
    buttonText: string;
    buttonVariant?: 'default' | 'outline';
}

interface PricingCardProps {
    tier: PricingTier;
    className?: string;
    annual?: boolean;
    style?: React.CSSProperties;
}

export function PricingCard({ tier, className = "", annual = false, style }: PricingCardProps) {
    const displayPrice = annual && tier.interval === 'month' ? tier.price * 10 : tier.price; // 2 months free for annual
    const displayInterval = annual ? 'year' : tier.interval;
    const savings = annual && tier.interval === 'month' ? tier.price * 2 : 0;

    return (
        <Card className={`relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${tier.popular
            ? 'border-purple-500 shadow-purple-500/20 shadow-xl'
            : 'border-white/20 dark:border-gray-700/20'
            } ${className}`} style={style}>
            {tier.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        En Popüler
                    </div>
                </div>
            )}

            <CardHeader className="text-center pb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {tier.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {tier.description}
                </p>

                <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-2">
                        {tier.originalPrice && annual && (
                            <span className="text-lg text-gray-500 line-through">
                                ₺{tier.originalPrice * 12}
                            </span>
                        )}
                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                            {tier.price === 0 ? 'Ücretsiz' : `₺${displayPrice}`}
                        </span>
                        {tier.price > 0 && (
                            <span className="text-gray-600 dark:text-gray-400">
                                /{displayInterval === 'year' ? 'yıl' : 'ay'}
                            </span>
                        )}
                    </div>

                    {savings > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-semibold">
                            Yıllık ödemede ₺{savings} tasarruf!
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                {tier.limitations && tier.limitations.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sınırlamalar:</p>
                        <div className="space-y-1">
                            {tier.limitations.map((limitation, index) => (
                                <div key={index} className="text-xs text-gray-500 dark:text-gray-400">
                                    • {limitation}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Link href="/getstarted" className="w-full">
                    <Button
                        className={`w-full py-3 font-semibold transition-all duration-300 ${tier.popular
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            : tier.buttonVariant === 'outline'
                                ? 'border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                            }`}
                    >
                        {tier.buttonText}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}