"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CTAButtonsProps {
    className?: string;
}

export function CTAButtons({ className = "" }: CTAButtonsProps) {
    const [isHoveringPrimary, setIsHoveringPrimary] = useState(false);
    const [isHoveringSecondary, setIsHoveringSecondary] = useState(false);

    const handleCTAClick = async (ctaName: string) => {
        const { Analytics } = await import('@/lib/analytics');
        Analytics.trackCTAClick(ctaName, 'hero_section');
    };

    return (
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${className}`}>
            {/* Primary CTA - Start Journey */}
            <Link href="/getstarted" className="w-full sm:w-auto">
                <Button
                    size="lg"
                    onMouseEnter={() => setIsHoveringPrimary(true)}
                    onMouseLeave={() => setIsHoveringPrimary(false)}
                    onClick={() => handleCTAClick('start_journey')}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-8 py-4 text-lg font-semibold shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Seyahatine Başla
                    <ArrowRight
                        className={`w-5 h-5 ml-2 transition-transform duration-300 ${isHoveringPrimary ? 'translate-x-1' : ''
                            }`}
                    />
                </Button>
            </Link>

            {/* Secondary CTA - Explore Community */}
            <Link href="/dashboard/explore" className="w-full sm:w-auto">
                <Button
                    variant="outline"
                    size="lg"
                    onMouseEnter={() => setIsHoveringSecondary(true)}
                    onMouseLeave={() => setIsHoveringSecondary(false)}
                    onClick={() => handleCTAClick('explore_community')}
                    className="w-full sm:w-auto bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border-2 border-white/30 dark:border-gray-700/30 text-gray-900 dark:text-white hover:bg-white/20 dark:hover:bg-gray-800/20 rounded-full px-8 py-4 text-lg font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                >
                    <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Topluluğu Keşfet
                    <ArrowRight
                        className={`w-5 h-5 ml-2 transition-transform duration-300 ${isHoveringSecondary ? 'translate-x-1' : ''
                            }`}
                    />
                </Button>
            </Link>
        </div>
    );
}