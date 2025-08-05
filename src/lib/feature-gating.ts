import { SubscriptionTier, UserProfile } from '@/types/auth';
import { BarChart3, Compass, Home, Plane, Settings, Star, User } from 'lucide-react';

export type FeatureName =
    | 'unlimited_experiences'
    | 'advanced_analytics'
    | 'export_data'
    | 'priority_support'
    | 'custom_themes'
    | 'api_access'
    | 'bulk_operations'
    | 'advanced_search'
    | 'collaboration'
    | 'white_label';

export interface FeatureAccess {
    hasAccess: boolean;
    reason?: string;
    upgradeRequired?: string;
}

const tierNamesPretty: Record<string, string> = {
    free: 'Free',
    explorer: 'Explorer',
    traveler: 'Traveler',
    enterprise: 'Enterprise',
};

const featureRequirement: Record<FeatureName, string[]> = {
    unlimited_experiences: ['traveler', 'enterprise'],
    advanced_analytics: ['traveler', 'enterprise'],
    export_data: ['explorer', 'traveler', 'enterprise'],
    priority_support: ['traveler', 'enterprise'],
    custom_themes: ['traveler', 'enterprise'],
    api_access: ['enterprise'],
    bulk_operations: ['traveler', 'enterprise'],
    advanced_search: ['explorer', 'traveler', 'enterprise'],
    collaboration: ['traveler', 'enterprise'],
    white_label: ['enterprise'],
};

export const subscriptionMenuConfig = {
    free: [
        'Overview',
        'Favorites'
    ],
    explorer: [
        'Overview',
        'My Trips',
        'Favorites',
        'Explore'
    ],
    traveler: [
        'Overview',
        'My Trips',
        'Favorites',
        'Explore',
        'Analytics'
    ],
    enterprise: [
        'Overview',
        'My Trips',
        'Favorites',
        'Explore',
        'Analytics'
    ]
};

export const menuItems = [
    { label: 'Overview', href: '/dashboard', icon: Home, description: 'Dashboard overview' },
    { label: 'My Trips', href: '/dashboard/my-trips', icon: Plane, description: 'View your trips', badge: '3' },
    { label: 'Favorites', href: '/dashboard/favorites', icon: Star, description: 'Saved destinations' },
    { label: 'Explore', href: '/dashboard/explore', icon: Compass, description: 'Discover new places' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Travel statistics' }
];

export const bottomMenu = [
    { label: 'Profile', href: '/dashboard/profile', icon: User, description: 'Manage profile' },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'App settings' }
];

/**
 * Check if user has access to a specific feature based on subscription
 */
export function hasFeatureAccess(
    feature: FeatureName,
    profile: UserProfile | null,
    subscription: SubscriptionTier | null
): FeatureAccess {
    if (!profile || !subscription) {
        return {
            hasAccess: false,
            reason: 'Authentication required',
            upgradeRequired: 'explorer',
        };
    }

    if (profile.is_admin) return { hasAccess: true };

    const currentTier = subscription.id;
    const allowedTiers = featureRequirement[feature];

    const hasAccess = allowedTiers.includes(currentTier);

    return {
        hasAccess,
        reason: hasAccess
            ? undefined
            : `This feature requires ${tierNamesPretty[allowedTiers[0]]} plan.`,
        upgradeRequired: hasAccess ? undefined : allowedTiers[0],
    };
}

/**
 * Check usage limits based on subscription limits and current usage
 */
export function checkUsageLimits(
    profile: UserProfile | null,
    subscription: SubscriptionTier | null,
    currentUsage: {
        experiences: number;
        exports: number;
        storage: number; // in bytes
    }
): {
    experiences: { current: number; limit: number; canAdd: boolean };
    storage: { current: number; limit: number; canAdd: boolean };
    exports: { current: number; limit: number; canAdd: boolean };
} {
    if (!profile || !subscription) {
        return {
            experiences: { current: 0, limit: 0, canAdd: false },
            storage: { current: 0, limit: 0, canAdd: false },
            exports: { current: 0, limit: 0, canAdd: false },
        };
    }

    const { experiences, exports, storage } = subscription.limits;

    return {
        experiences: {
            current: currentUsage.experiences,
            limit: experiences,
            canAdd: experiences === -1 || currentUsage.experiences < experiences,
        },
        storage: {
            current: currentUsage.storage,
            limit: storage,
            canAdd: storage === -1 || currentUsage.storage < storage,
        },
        exports: {
            current: currentUsage.exports,
            limit: exports,
            canAdd: exports === -1 || currentUsage.exports < exports,
        },
    };
}

/**
 * Get upgrade message for a specific feature
 */
export function getUpgradeMessage(feature: FeatureName, requiredTier: string): string {
    const featureNames: Record<FeatureName, string> = {
        unlimited_experiences: 'unlimited experiences',
        advanced_analytics: 'advanced analytics',
        export_data: 'data export',
        priority_support: 'priority support',
        custom_themes: 'custom themes',
        api_access: 'API access',
        bulk_operations: 'bulk operations',
        advanced_search: 'advanced search',
        collaboration: 'collaboration features',
        white_label: 'white label features',
    };

    return `Upgrade to ${tierNamesPretty[requiredTier]} to unlock ${featureNames[feature]}.`;
}
