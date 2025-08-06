/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTranslation } from "@/contexts/I18nContext";
import { Globe, Users, MapPin, Share2, Shield, Smartphone } from "lucide-react";


// FeatureCard Component
function FeatureCard({ icon, title, description, className = "", style }: any) {
    return (
        <div
            className={`
        group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105
        bg-white dark:bg-gray-900/50 
        border-gray-200 dark:border-gray-800 
        hover:border-gray-300 dark:hover:border-gray-700 
        hover:shadow-xl dark:hover:bg-gray-900/70
        backdrop-blur-sm ${className}
      `}
            style={style}
        >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 transition-colors duration-300 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-white group-hover:from-gray-200 group-hover:to-gray-100 dark:group-hover:from-gray-700 dark:group-hover:to-gray-600">
                {icon}
            </div>

            <h3 className="text-xl font-semibold mb-3 transition-colors duration-300 text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-gray-100">
                {title}
            </h3>

            <p className="text-sm leading-relaxed transition-colors duration-300 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                {description}
            </p>

            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-gray-50/50 to-transparent dark:from-white/5 dark:to-transparent" />
        </div>
    );
}

export function FeatureGrid() {
    const { t } = useTranslation();

    const features = [
        {
            icon: <Globe className="w-8 h-8" />,
            title: t("features.items.authentic.title"),
            description: t("features.items.authentic.description")
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: t("features.items.community.title"),
            description: t("features.items.community.description")
        },
        {
            icon: <MapPin className="w-8 h-8" />,
            title: t("features.items.local.title"),
            description: t("features.items.local.description")
        },
        {
            icon: <Share2 className="w-8 h-8" />,
            title: t("features.items.easy.title"),
            description: t("features.items.easy.description")
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: t("features.items.secure.title"),
            description: t("features.items.secure.description")
        },
        {
            icon: <Smartphone className="w-8 h-8" />,
            title: t("features.items.mobile.title"),
            description: t("features.items.mobile.description")
        }
    ];

    return (
        <section className="w-full max-w-7xl mx-auto pt-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    {t("features.title")}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {t("features.subtitle")}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        className="animate-in fade-in-0 slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                    />
                ))}
            </div>
        </section>
    );
}