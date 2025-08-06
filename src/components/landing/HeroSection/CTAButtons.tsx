"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/I18nContext";
import Link from "next/link";

interface CTAButtonsProps {
    className?: string;
}

export function CTAButtons({ className = "" }: CTAButtonsProps) {
    const { t } = useTranslation();
    const [isHoveringPrimary, setIsHoveringPrimary] = useState(false);
    const [isHoveringSecondary, setIsHoveringSecondary] = useState(false);

    const handleCTAClick = async (ctaName: string) => {
        try {
            const { Analytics } = await import('@/lib/analytics');
            Analytics.trackCTAClick(ctaName, 'hero_section');
        } catch (error) {
            console.log('Analytics not available:', error);
        }
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
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover-lift group"
                >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    {t('hero.cta.primary')}
                    <ArrowRight
                        className={`w-5 h-5 ml-2 transition-transform duration-300 ${isHoveringPrimary ? 'translate-x-1' : ''
                            }`}
                    />
                </Button>
            </Link>

            {/* Secondary CTA - Learn More */}
            <Link href="/about" className="w-full sm:w-auto">
                <Button
                    variant="outline"
                    size="lg"
                    onMouseEnter={() => setIsHoveringSecondary(true)}
                    onMouseLeave={() => setIsHoveringSecondary(false)}
                    onClick={() => handleCTAClick('learn_more')}
                    className="w-full sm:w-auto bg-card/60 backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground rounded-xl px-8 py-4 text-lg font-semibold shadow-sm hover-lift group"
                >
                    <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    {t('hero.cta.secondary')}
                    <ArrowRight
                        className={`w-5 h-5 ml-2 transition-transform duration-300 ${isHoveringSecondary ? 'translate-x-1' : ''
                            }`}
                    />
                </Button>
            </Link>
        </div>
    );
}