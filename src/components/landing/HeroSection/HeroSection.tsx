"use client";

import { HeroContent, SearchBar, CTAButtons } from './index';

interface HeroSectionProps {
    onSearch?: (query: string) => void;
    className?: string;
}

export function HeroSection({ onSearch, className = "" }: HeroSectionProps) {
    const handleSearch = (query: string) => {
        // Handle search logic here - could navigate to search results
        console.log('Searching for:', query);
        onSearch?.(query);
    };

    return (
        <section className={`relative min-h-screen flex items-center justify-center ${className}`}>
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-6xl mx-auto px-4 py-12 space-y-12">
                <HeroContent />

                <SearchBar onSearch={handleSearch} />

                <CTAButtons />
            </div>
        </section>
    );
}