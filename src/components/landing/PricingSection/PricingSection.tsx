"use client";

import { useState } from "react";
import { PricingCard } from "./PricingCard";
import { Button } from "@/components/ui/button";

const pricingTiers = [
    {
        id: 'free',
        name: 'Keşifçi',
        price: 0,
        interval: 'month' as const,
        description: 'Mikro seyahate başlamak için ideal',
        features: [
            '5 seyahat deneyimi paylaşımı',
            '50MB fotoğraf depolama',
            'Temel topluluk erişimi',
            'Mobil uygulama erişimi',
            'Temel seyahat önerileri'
        ],
        limitations: [
            'Premium rotalar erişimi yok',
            'Sınırlı fotoğraf depolama',
            'Temel destek'
        ],
        buttonText: 'Ücretsiz Başla',
        buttonVariant: 'outline' as const
    },
    {
        id: 'explorer',
        name: 'Gezgin',
        price: 49,
        originalPrice: 59,
        interval: 'month' as const,
        description: 'Aktif seyahat severlere özel',
        features: [
            '50 seyahat deneyimi paylaşımı',
            '500MB fotoğraf depolama',
            'Premium topluluk erişimi',
            'Özel seyahat rotaları',
            'Gelişmiş filtreleme',
            'Offline harita erişimi',
            'Öncelikli müşteri desteği'
        ],
        popular: true,
        buttonText: 'Gezgin Ol'
    },
    {
        id: 'traveler',
        name: 'Seyyah',
        price: 99,
        originalPrice: 119,
        interval: 'month' as const,
        description: 'Profesyonel seyahat deneyimi',
        features: [
            'Sınırsız seyahat paylaşımı',
            '5GB fotoğraf depolama',
            'VIP topluluk erişimi',
            'Kişisel seyahat danışmanı',
            'Özel etkinlik davetiyeleri',
            'Gelişmiş analitik raporlar',
            'API erişimi',
            '7/24 premium destek',
            'Özel rozet ve profil'
        ],
        buttonText: 'Seyyah Ol'
    },
    {
        id: 'enterprise',
        name: 'Kurumsal',
        price: 299,
        interval: 'month' as const,
        description: 'Şirketler ve büyük gruplar için',
        features: [
            'Sınırsız kullanıcı hesabı',
            'Sınırsız depolama',
            'Özel marka entegrasyonu',
            'Gelişmiş yönetim paneli',
            'Özel API entegrasyonu',
            'Dedicated hesap yöneticisi',
            'Özel eğitim ve onboarding',
            'SLA garantisi',
            'Özel raporlama'
        ],
        buttonText: 'İletişime Geç'
    }
];

interface PricingSectionProps {
    className?: string;
}

export function PricingSection({ className = "" }: PricingSectionProps) {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <section className={`max-w-7xl mx-auto px-4 ${className}`}>
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    Size Uygun Planı Seçin
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                    İhtiyaçlarınıza göre tasarlanmış esnek fiyatlandırma seçenekleri
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full p-1 border border-white/20 dark:border-gray-700/20 shadow-lg">
                    <Button
                        variant={!isAnnual ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setIsAnnual(false)}
                        className={`rounded-full px-6 py-2 transition-all ${!isAnnual
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Aylık
                    </Button>
                    <Button
                        variant={isAnnual ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setIsAnnual(true)}
                        className={`rounded-full px-6 py-2 transition-all ${isAnnual
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Yıllık
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            2 Ay Bedava
                        </span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((tier, index) => (
                    <PricingCard
                        key={tier.id}
                        tier={tier}
                        annual={isAnnual}
                        className="animate-in fade-in-0 slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Tüm planlar 14 gün ücretsiz deneme ile gelir. İstediğiniz zaman iptal edebilirsiniz.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <span>✓ Güvenli ödeme</span>
                    <span>✓ Anında aktivasyon</span>
                    <span>✓ 7/24 destek</span>
                    <span>✓ Para iade garantisi</span>
                </div>
            </div>
        </section>
    );
}