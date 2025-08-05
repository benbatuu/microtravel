"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialCard } from "./TestimonialCard";

const testimonials = [
    {
        name: "Ayşe Yılmaz",
        location: "İstanbul",
        rating: 5,
        text: "Harika bir deneyimdi! 3 günlük Kapadokya mikro seyahati beklentilerimi aştı. Her detay mükemmel planlanmış ve rehberimiz çok bilgiliydi.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b1dc4060?w=100&h=100&fit=crop&crop=face"
    },
    {
        name: "Mehmet Özkan",
        location: "Ankara",
        rating: 5,
        text: "Kısa tatil molası için mükemmel! 2 günde Safranbolu'yu keşfetmek harika bir fikirdi. Kesinlikle tavsiye ederim, organizasyon kusursuzdu.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
        name: "Zeynep Kaya",
        location: "İzmir",
        rating: 5,
        text: "Ailecek gittiğimiz Bozcaada turu unutulmazdı. Çocuklar çok eğlendi, biz de dinlendik. Harika organizasyon ve çok güzel anılar biriktirdik!",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    {
        name: "Can Demir",
        location: "Bursa",
        rating: 5,
        text: "Solo seyahat için ideal! Güvenli, eğlenceli ve çok iyi organize edilmiş. Yeni arkadaşlıklar kurdum ve kendimi yeniden keşfettim.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
        name: "Elif Şahin",
        location: "Antalya",
        rating: 5,
        text: "Fotoğraf tutkunu olarak, rehberin önerdiği açılar ve zamanlamalar sayesinde harika kareler yakaladım. Teknik bilgiler çok faydalıydı.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
    },
    {
        name: "Oğuz Kara",
        location: "Trabzon",
        rating: 5,
        text: "İş yoğunluğu arasında mükemmel bir nefes alma fırsatı. Kısa sürede bu kadar çok şey görmek ve yaşamak mümkünmüş. Çok memnunum.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    }
];

interface TestimonialsSectionProps {
    className?: string;
}

export function TestimonialsSection({ className = "" }: TestimonialsSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const goToTestimonial = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    // Calculate visible testimonials for responsive design
    const getVisibleTestimonials = () => {
        const visibleCount = 3; // Show 3 testimonials at once on desktop
        const testimonialsCopy = [...testimonials, ...testimonials]; // Duplicate for seamless loop
        return testimonialsCopy.slice(currentIndex, currentIndex + visibleCount);
    };

    return (
        <section className={`max-w-7xl mx-auto px-4 ${className}`}>
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    Seyahatçilerimiz Ne Diyor?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Gerçek deneyimler, gerçek yorumlar. Binlerce mutlu seyahatçımızın hikayelerini keşfedin.
                </p>
            </div>

            {/* Carousel Container */}
            <div className="relative">
                {/* Navigation Buttons */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={prevTestimonial}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    aria-label="Previous testimonial"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    aria-label="Next testimonial"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
                    {getVisibleTestimonials().map((testimonial, index) => (
                        <TestimonialCard
                            key={`${currentIndex}-${index}`}
                            name={testimonial.name}
                            location={testimonial.location}
                            rating={testimonial.rating}
                            text={testimonial.text}
                            avatar={testimonial.avatar}
                            className="animate-in fade-in-0 slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                        />
                    ))}
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToTestimonial(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-125'
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Auto-play Control */}
                <div className="text-center mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        {isAutoPlaying ? 'Otomatik oynatmayı durdur' : 'Otomatik oynatmayı başlat'}
                    </Button>
                </div>
            </div>
        </section>
    );
}