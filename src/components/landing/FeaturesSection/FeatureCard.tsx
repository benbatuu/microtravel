"use client";

import { ReactNode } from "react";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    className?: string;
    style?: React.CSSProperties;
}

export function FeatureCard({ icon, title, description, className = "", style }: FeatureCardProps) {
    return (
        <div className={`group p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${className}`} style={style}>
            <div className="text-purple-600 dark:text-purple-400 mb-4 transform group-hover:scale-110 transition-transform flex justify-center">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                {description}
            </p>
        </div>
    );
}