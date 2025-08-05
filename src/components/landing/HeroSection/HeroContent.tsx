"use client";

import { Sparkles } from "lucide-react";

interface HeroContentProps {
    className?: string;
}

export function HeroContent({ className = "" }: HeroContentProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-full border border-white/30 dark:border-gray-700/30">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Yeni nesil seyahat deneyimi
                </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Mikro Seyahat
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                    Deneyimini Keşfet
                </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
                Küçük ama unutulmaz seyahat planlarını bul ve paylaş. Her an yeni bir macera seni bekliyor.
            </p>
        </div>
    );
}