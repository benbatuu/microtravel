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
        <section className={`relative min-h-screen flex items-center justify-center gradient-elegant ${className}`}>
            {/* Elegant Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/20 to-muted/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
            </div>

            {/* Elegant Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-6xl mx-auto px-4 py-12 space-y-12">
                <div className="animate-fade-in">
                    <HeroContent />
                </div>

                <div className="animate-slide-in-from-bottom animation-delay-300">
                    <SearchBar onSearch={handleSearch} />
                </div>

                <div className="animate-slide-in-from-bottom animation-delay-500">
                    <CTAButtons />
                </div>
            </div>
        </section>
    );
}