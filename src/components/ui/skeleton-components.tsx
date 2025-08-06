"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
    return (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ExperienceCardSkeleton() {
    return (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-0">
                <div className="space-y-4">
                    <Skeleton className="h-56 w-full rounded-t-xl" />
                    <div className="p-6 space-y-4">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ProfileSkeleton() {
    return (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-8">
                <div className="flex items-center space-x-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-3 flex-1">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <ExperienceCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-0">
                <div className="space-y-0">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>

                    {/* Rows */}
                    {[...Array(rows)].map((_, i) => (
                        <div key={i} className="p-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                            <div className="flex space-x-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function FormSkeleton() {
    return (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
}