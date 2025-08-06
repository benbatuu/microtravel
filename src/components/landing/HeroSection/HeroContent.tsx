"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

interface HeroContentProps {
    className?: string;
}

export function HeroContent({ className = "" }: HeroContentProps) {
    const { t } = useTranslation();

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-sm rounded-full border border-border/50 shadow-sm hover-lift">
                <Sparkles className="w-4 h-4 text-primary animate-pulse-subtle" />
                <span className="text-sm font-medium text-muted-foreground">
                    {t('hero.badge')}
                </span>
            </div>

            <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
                    {t('hero.title')}
                </h1>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-muted-foreground">
                    {t('hero.subtitle')}
                </h2>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t('hero.description')}
            </p>
        </div>
    );
}