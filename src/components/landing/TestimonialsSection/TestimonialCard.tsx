"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";

interface TestimonialCardProps {
    name: string;
    location: string;
    rating: number;
    text: string;
    avatar: string;
    className?: string;
    style?: React.CSSProperties;
}

export function TestimonialCard({
    name,
    location,
    rating,
    text,
    avatar,
    className = "",
    style
}: TestimonialCardProps) {
    return (
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${className}`} style={style}>
            {/* Quote Icon */}
            <Quote className="w-8 h-8 text-purple-600/20 dark:text-purple-400/20 mb-4" />

            {/* Testimonial Text */}
            <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                &quot;{text}&quot;
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                ))}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Image
                        src={avatar}
                        alt={name}
                        width={50}
                        height={50}
                        className="rounded-full ring-2 ring-purple-500/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        {name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {location}
                    </p>
                </div>
            </div>
        </div>
    );
}