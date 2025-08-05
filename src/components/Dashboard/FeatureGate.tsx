'use client';

import { ReactNode, useState } from 'react';
import { Crown, Lock, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasFeatureAccess, getUpgradeMessage, FeatureName } from '@/lib/feature-gating';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FeatureGateProps {
    feature: FeatureName;
    children: ReactNode;
    fallback?: ReactNode;
    showUpgradePrompt?: boolean;
    className?: string;
}

/**
 * Component that conditionally renders content based on feature access
 */
export default function FeatureGate({
    feature,
    children,
    fallback,
    showUpgradePrompt = true,
    className
}: FeatureGateProps) {
    const { profile, subscription } = useAuth();
    const access = hasFeatureAccess(feature, profile, subscription);

    if (access.hasAccess) {
        return <div className={className}>{children}</div>;
    }

    if (fallback) {
        return <div className={className}>{fallback}</div>;
    }

    if (showUpgradePrompt) {
        return (
            <div className={className}>
                <UpgradePrompt
                    feature={feature}
                    reason={access.reason}
                    requiredTier={access.upgradeRequired}
                />
            </div>
        );
    }

    return null;
}

interface UpgradePromptProps {
    feature: FeatureName;
    reason?: string;
    requiredTier?: string;
    className?: string;
    variant?: 'card' | 'inline' | 'modal';
}

/**
 * Component that shows upgrade prompts for premium features
 */
export function UpgradePrompt({
    feature,
    reason,
    requiredTier = 'explorer',
    className,
    variant = 'card'
}: UpgradePromptProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const tierNames: Record<string, string> = {
        explorer: 'Explorer',
        traveler: 'Traveler',
        enterprise: 'Enterprise'
    };

    const tierColors: Record<string, string> = {
        explorer: 'bg-blue-500',
        traveler: 'bg-purple-500',
        enterprise: 'bg-gold-500'
    };

    const upgradeMessage = requiredTier ? getUpgradeMessage(feature, requiredTier) : reason;

    if (variant === 'inline') {
        return (
            <div className={cn(
                "flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed",
                className
            )}>
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1">
                    {upgradeMessage}
                </span>
                <Button size="sm" asChild>
                    <Link href="/dashboard/settings?tab=subscription">
                        Upgrade
                    </Link>
                </Button>
            </div>
        );
    }

    if (variant === 'modal') {
        return (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className={className}>
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock Feature
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-500" />
                            Premium Feature
                        </DialogTitle>
                        <DialogDescription>
                            {upgradeMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 pt-4">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-white",
                                tierColors[requiredTier]
                            )}>
                                <Crown className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium">{tierNames[requiredTier]} Plan</p>
                                <p className="text-sm text-muted-foreground">
                                    Unlock this feature and more
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Maybe Later
                            </Button>
                            <Button asChild className="flex-1">
                                <Link href="/dashboard/settings?tab=subscription">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Upgrade Now
                                </Link>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Default card variant
    return (
        <Card className={cn("border-dashed", className)}>
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">Premium Feature</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                    {upgradeMessage}
                </p>

                {requiredTier && (
                    <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    >
                        <Crown className="w-3 h-3 mr-1" />
                        {tierNames[requiredTier]} Required
                    </Badge>
                )}

                <Button asChild className="w-full">
                    <Link href="/dashboard/settings?tab=subscription">
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade Plan
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

// Hook for checking feature access in components
export function useFeatureAccess(feature: FeatureName) {
    const { profile, subscription } = useAuth();
    return hasFeatureAccess(feature, profile, subscription);
}

// Component for showing feature availability badges
interface FeatureBadgeProps {
    feature: FeatureName;
    className?: string;
}

export function FeatureBadge({ feature, className }: FeatureBadgeProps) {
    const access = useFeatureAccess(feature);

    if (access.hasAccess) {
        return (
            <Badge variant="default" className={cn("text-xs", className)}>
                <Crown className="w-3 h-3 mr-1" />
                Available
            </Badge>
        );
    }

    return (
        <Badge variant="secondary" className={cn("text-xs", className)}>
            <Lock className="w-3 h-3 mr-1" />
            Premium
        </Badge>
    );
}