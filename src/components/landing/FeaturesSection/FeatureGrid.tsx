"use client";

import { Plane, Globe, Users, Camera, MapPin, Heart, Shield, Clock } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
    {
        icon: <Plane className="w-8 h-8" />,
        title: "Mikro Seyahatler",
        description: "Kısa sürede maksimum deneyim sunan özenle planlanmış seyahat rotaları"
    },
    {
        icon: <Globe className="w-8 h-8" />,
        title: "Küresel Ağ",
        description: "Dünya çapında 200+ destinasyon ve yerel rehberlerle otantik deneyimler"
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: "Topluluk",
        description: "50K+ aktif gezgin topluluğu ile deneyim paylaşımı ve öneriler"
    },
    {
        icon: <Camera className="w-8 h-8" />,
        title: "Anı Paylaşımı",
        description: "Seyahat anılarınızı fotoğraflar ve hikayelerle topluluğa paylaşın"
    },
    {
        icon: <MapPin className="w-8 h-8" />,
        title: "Kişisel Rotalar",
        description: "Size özel tasarlanmış rotalar ve gizli kalmış yerler keşfi"
    },
    {
        icon: <Heart className="w-8 h-8" />,
        title: "Favoriler",
        description: "Beğendiğiniz yerleri kaydedin ve kendi seyahat listenizi oluşturun"
    },
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Güvenli Seyahat",
        description: "7/24 destek, sigorta seçenekleri ve güvenli ödeme sistemi"
    },
    {
        icon: <Clock className="w-8 h-8" />,
        title: "Esnek Planlama",
        description: "Son dakika rezervasyonları ve esnek iptal politikaları"
    }
];

interface FeatureGridProps {
    className?: string;
    maxFeatures?: number;
}

export function FeatureGrid({ className = "", maxFeatures }: FeatureGridProps) {
    const displayFeatures = maxFeatures ? features.slice(0, maxFeatures) : features;

    return (
        <section className={`max-w-7xl mx-auto px-4 ${className}`}>
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    Neden Mikro Seyahat?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Seyahat deneyiminizi daha anlamlı ve unutulmaz kılacak özelliklerimizi keşfedin
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayFeatures.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        className="animate-in fade-in-0 slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                    />
                ))}
            </div>
        </section>
    );
}