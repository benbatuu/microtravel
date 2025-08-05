'use client';

import { Crown, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SubscriptionStatusProps {
    className?: string;
    showDetails?: boolean;
    compact?: boolean;
}

export default function SubscriptionStatus({
    className,
    showDetails = true,
    compact = false
}: SubscriptionStatusProps) {
    const { profile, subscription, isSubscribed, hasActiveSubscription } = useAuth();

    if (!profile || !subscription) {
        return null;
    }

    // Calculate usage percentages
    const storageUsed = profile.storage_used || 0;
    const storageLimit = subscription.limits.storage * 1024 * 1024; // Convert MB to bytes
    const storagePercentage = Math.min((storageUsed / storageLimit) * 100, 100);

    // Mock experience count (would come from actual data)
    const experienceCount = 8; // This would be fetched from the database
    const experienceLimit = subscription.limits.experiences;
    const experiencePercentage = experienceLimit === -1 ? 0 : Math.min((experienceCount / experienceLimit) * 100, 100);

    const getStatusColor = () => {
        if (!hasActiveSubscription) return 'text-red-600';
        if (isSubscribed) return 'text-green-600';
        return 'text-gray-600';
    };

    const getStatusIcon = () => {
        if (!hasActiveSubscription) return AlertTriangle;
        if (isSubscribed) return Crown;
        return CheckCircle;
    };

    const StatusIcon = getStatusIcon();

    if (compact) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <StatusIcon className={cn("w-4 h-4", getStatusColor())} />
                <Badge variant={isSubscribed ? "default" : "secondary"} className="text-xs">
                    {subscription.name}
                </Badge>
            </div>
        );
    }

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <StatusIcon className={cn("w-5 h-5", getStatusColor())} />
                        Subscription Status
                    </CardTitle>
                    <Badge
                        variant={isSubscribed ? "default" : "secondary"}
                        className="text-sm"
                    >
                        {isSubscribed && <Crown className="w-3 h-3 mr-1" />}
                        {subscription.name}
                    </Badge>
                </div>
            </CardHeader>

            {showDetails && (
                <CardContent className="space-y-4">
                    {/* Plan Details */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Plan</span>
                            <span className="font-medium">{subscription.name}</span>
                        </div>

                        {isSubscribed && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-medium text-green-600">Active</span>
                                </div>

                                {profile.subscription_end_date && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Next billing</span>
                                        <span className="font-medium">
                                            {new Date(profile.subscription_end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Usage Indicators */}
                    <div className="space-y-4">
                        {/* Experience Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Experiences</span>
                                <span className="font-medium">
                                    {experienceCount}
                                    {experienceLimit === -1 ? ' / Unlimited' : ` / ${experienceLimit}`}
                                </span>
                            </div>
                            {experienceLimit !== -1 && (
                                <Progress
                                    value={experiencePercentage}
                                    className="h-2"
                                />
                            )}
                        </div>

                        {/* Storage Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Storage</span>
                                <span className="font-medium">
                                    {(storageUsed / (1024 * 1024)).toFixed(1)} MB / {subscription.limits.storage} MB
                                </span>
                            </div>
                            <Progress
                                value={storagePercentage}
                                className="h-2"
                            />
                        </div>

                        {/* Export Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Monthly Exports</span>
                                <span className="font-medium">
                                    0 / {subscription.limits.exports === -1 ? 'Unlimited' : subscription.limits.exports}
                                </span>
                            </div>
                            {subscription.limits.exports !== -1 && (
                                <Progress
                                    value={0}
                                    className="h-2"
                                />
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-2">
                        {!isSubscribed ? (
                            <Button asChild className="w-full">
                                <Link href="/dashboard/settings?tab=subscription">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Upgrade Plan
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/dashboard/settings?tab=subscription">
                                    Manage Subscription
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Warning Messages */}
                    {storagePercentage > 80 && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Storage is {storagePercentage.toFixed(0)}% full
                            </p>
                        </div>
                    )}

                    {experienceLimit !== -1 && experiencePercentage > 80 && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                You&apos;ve used {experiencePercentage.toFixed(0)}% of your experience limit
                            </p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// Compact version for use in headers/sidebars
export function CompactSubscriptionStatus({ className }: { className?: string }) {
    return <SubscriptionStatus compact className={className} />;
}

// Usage indicator component for specific features
interface UsageIndicatorProps {
    label: string;
    current: number;
    limit: number;
    unit?: string;
    className?: string;
}

export function UsageIndicator({
    label,
    current,
    limit,
    unit = '',
    className
}: UsageIndicatorProps) {
    const percentage = limit === -1 ? 0 : Math.min((current / limit) * 100, 100);
    const isNearLimit = percentage > 80;
    const isAtLimit = percentage >= 100;

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn(
                    "font-medium",
                    isAtLimit && "text-red-600",
                    isNearLimit && !isAtLimit && "text-yellow-600"
                )}>
                    {current}{unit}
                    {limit === -1 ? ' / Unlimited' : ` / ${limit}${unit}`}
                </span>
            </div>
            {limit !== -1 && (
                <Progress
                    value={percentage}
                    className={cn(
                        "h-2",
                        isAtLimit && "[&>div]:bg-red-500",
                        isNearLimit && !isAtLimit && "[&>div]:bg-yellow-500"
                    )}
                />
            )}
        </div>
    );
}