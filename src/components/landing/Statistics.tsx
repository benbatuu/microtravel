"use client";

import { useTranslation } from "@/contexts/I18nContext";
import { Users, MapPin, Camera, Heart } from "lucide-react";

const avatars = [
    "https://library.shadcnblocks.com/images/block/avatar-1.webp",
    "https://library.shadcnblocks.com/images/block/avatar-2.webp",
    "https://library.shadcnblocks.com/images/block/avatar-3.webp",
    "https://library.shadcnblocks.com/images/block/avatar-1.webp"
];

const icons = [
    <Users className="w-8 h-8" />,
    <MapPin className="w-8 h-8" />,
    <Camera className="w-8 h-8" />,
    <Heart className="w-8 h-8" />
];

export function StatisticsSection() {
    const { t } = useTranslation();
    const stats = [
        {
            avatar: avatars[0],
            icon: icons[0],
            number: t("statistics.items.users.number"),
            label: t("statistics.items.users.label")
        },
        {
            avatar: avatars[1],
            icon: icons[1],
            number: t("statistics.items.destinations.number"),
            label: t("statistics.items.destinations.label")
        },
        {
            avatar: avatars[2],
            icon: icons[2],
            number: t("statistics.items.photos.number"),
            label: t("statistics.items.photos.label")
        },
        {
            avatar: avatars[3],
            icon: icons[3],
            number: t("statistics.items.reviews.number"),
            label: t("statistics.items.reviews.label")
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto pt-24">
            <div className="pt-10 pb-10">
                <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <a href="#" key={i} className="block w-full">
                            <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 shadow-sm rounded-3xl border-2 p-10 transition hover:-translate-y-3 hover:border-primary">
                                <div data-slot="card-content" className="block p-0">
                                    <div className="flex items-center gap-7">
                                        <span data-slot="avatar" className="relative flex size-8 shrink-0 h-14 w-14 overflow-hidden rounded-full border">
                                            <img data-slot="avatar-image" className="aspect-square size-full" alt="" src={stat.avatar} />
                                        </span>
                                        <span>{stat.icon}</span>
                                    </div>
                                    <div className="mt-6 text-6xl leading-tight font-semibold">{stat.number}</div>
                                    <p className="mb-5 max-w-52 text-lg font-medium">{stat.label}</p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}