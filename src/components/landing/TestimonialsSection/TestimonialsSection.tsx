"use client";

import { useState, useEffect } from "react";
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Avatarlar sabit, metinler çeviri dosyasından
const testimonialAvatars = [
    "https://images.unsplash.com/photo-1494790108755-2616b1dc4060?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
];

interface TestimonialsSectionProps {
    className?: string;
}

export function TestimonialsSection({ className = "" }: TestimonialsSectionProps) {
    const { t, messages, isLoading } = useI18n();

    // Testimonials verisini doğrudan messages objesinden al
    let testimonials: any[] = messages?.testimonials?.items || [];
    // Avatarları ekle
    testimonials = testimonials.map((item, i) => ({ ...item, avatar: testimonialAvatars[i % testimonialAvatars.length] }));

    if (isLoading || testimonials.length === 0) {
        return null;
    }

    const [topTranslate, setTopTranslate] = useState(0);
    const [bottomTranslate, setBottomTranslate] = useState(0);

    // Üst sıra: saat yönünün tersine (sola doğru)
    useEffect(() => {
        const interval = setInterval(() => {
            setTopTranslate(prev => {
                const newTranslate = prev - 1;
                const cardWidth = 400; // Kart genişliği + padding
                const totalWidth = testimonials.length * cardWidth;
                return newTranslate <= -totalWidth ? 0 : newTranslate;
            });
        }, 20); // Daha hızlı hareket

        return () => clearInterval(interval);
    }, [testimonials.length]);

    // Alt sıra: saat yönüne (sağa doğru)
    useEffect(() => {
        const interval = setInterval(() => {
            setBottomTranslate(prev => {
                const newTranslate = prev + 1;
                const cardWidth = 400; // Kart genişliği + padding
                const totalWidth = testimonials.length * cardWidth;
                return newTranslate >= totalWidth ? 0 : newTranslate;
            });
        }, 20); // Daha hızlı hareket

        return () => clearInterval(interval);
    }, [testimonials.length]);

    // Testimonials'ı iki kez çoğalt (sürekli döngü için)
    const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

    return (
        <section className={`w-full max-w-7xl mx-auto pt-24 ${className}`}>
            <div className="container flex flex-col items-center gap-6">
                <h2 className="mb-2 text-center text-3xl font-semibold lg:text-5xl">
                    {t('testimonials.title')}
                </h2>
                <p className="text-muted-foreground lg:text-lg">
                    {t('testimonials.subtitle')}
                </p>
            </div>

            <div className="lg:container">
                <div className="mt-16 space-y-4">
                    {/* Üst sıra - saat yönünün tersine */}
                    <div className="relative" role="region" aria-roledescription="carousel">
                        <div className="overflow-hidden" data-slot="carousel-content">
                            <div
                                className="flex -ml-4"
                                style={{ transform: `translate3d(${topTranslate}px, 0px, 0px)` }}
                            >
                                {duplicatedTestimonials.map((testimonial, index) => (
                                    <div
                                        key={`top-${index}`}
                                        role="group"
                                        aria-roledescription="slide"
                                        data-slot="carousel-item"
                                        className="min-w-0 shrink-0 grow-0 pl-4 basis-auto"
                                    >
                                        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm max-w-96 p-6 select-none">
                                            <CardContent className="p-0">
                                                <div className="mb-4 flex gap-4">
                                                    <Avatar className="relative flex shrink-0 overflow-hidden size-9 rounded-full ring-1 ring-input">
                                                        <AvatarImage
                                                            data-slot="avatar-image"
                                                            className="aspect-square size-full"
                                                            alt={testimonial.name}
                                                            src={testimonial.avatar}
                                                        />
                                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-sm">
                                                        <p className="font-medium">{testimonial.name}</p>
                                                        <p className="text-muted-foreground">{testimonial.role}</p>
                                                    </div>
                                                </div>
                                                <q className="text-sm">{testimonial.content}</q>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Alt sıra - saat yönüne */}
                    <div className="relative" role="region" aria-roledescription="carousel">
                        <div className="overflow-hidden" data-slot="carousel-content">
                            <div
                                className="flex -ml-4"
                                style={{ transform: `translate3d(${bottomTranslate}px, 0px, 0px)` }}
                            >
                                {duplicatedTestimonials.map((testimonial, index) => (
                                    <div
                                        key={`bottom-${index}`}
                                        role="group"
                                        aria-roledescription="slide"
                                        data-slot="carousel-item"
                                        className="min-w-0 shrink-0 grow-0 pl-4 basis-auto"
                                    >
                                        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm max-w-96 p-6 select-none">
                                            <CardContent className="p-0">
                                                <div className="mb-4 flex gap-4">
                                                    <Avatar className="relative flex shrink-0 overflow-hidden size-9 rounded-full ring-1 ring-input">
                                                        <AvatarImage
                                                            data-slot="avatar-image"
                                                            className="aspect-square size-full"
                                                            alt={testimonial.name}
                                                            src={testimonial.avatar}
                                                        />
                                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-sm">
                                                        <p className="font-medium">{testimonial.name}</p>
                                                        <p className="text-muted-foreground">{testimonial.role}</p>
                                                    </div>
                                                </div>
                                                <q className="text-sm">{testimonial.content}</q>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}