"use client";

import { useI18n } from '@/contexts/I18nContext';
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function DestinationsSection({ className = "" }) {
    const { t, messages, isLoading } = useI18n();
    const destinations = messages?.destinations?.items || [];
    if (isLoading || destinations.length === 0) return null;

    return (
        <section className={`w-full max-w-7xl mx-auto pt-24 ${className}`}>
            <div className="container">
                <div className="mb-16 max-w-2xl">
                    <h2 className="text-foreground mb-4 text-4xl font-medium md:text-6xl">
                        {t('destinations.title')}
                    </h2>
                    <p className="text-muted-foreground text-base tracking-tight">
                        {t('destinations.subtitle')}
                    </p>
                </div>
                <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
                    {destinations.map((dest: any, i: number) => (
                        <a
                            key={dest.name}
                            href="#"
                            className="group mb-6 block break-inside-avoid overflow-hidden rounded-xl"
                        >
                            <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm relative h-80 overflow-hidden p-0">
                                <Image
                                    src={dest.image}
                                    alt={dest.name}
                                    fill
                                    className="absolute inset-0 h-full w-full object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <div data-slot="card-content" className="absolute inset-0 flex flex-col justify-end p-6">
                                    <div className="font-semibold text-white text-lg">
                                        {dest.name}
                                    </div>
                                    <div className="text-white text-xs opacity-80">
                                        {dest.country}
                                    </div>
                                </div>
                                <ArrowUpRight className="absolute right-6 top-6 h-6 w-6 text-white transition-all duration-300 group-hover:rotate-45" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
} 