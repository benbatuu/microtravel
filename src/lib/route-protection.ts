/**
 * Route protection utilities and configuration
 */

export type SubscriptionTier = 'free' | 'explorer' | 'traveler' | 'enterprise'
export type ProtectionLevel = 'public' | 'auth_required' | 'subscription_required' | 'admin_only'

export interface RouteProtectionConfig {
    path: string
    authRequired: boolean
    subscriptionRequired?: SubscriptionTier
    adminOnly?: boolean
    redirectTo?: string
    description?: string
}

/**
 * Check if user has required subscription tier
 */
export function hasRequiredSubscription(userTier: string, requiredTier: string): boolean {
    const tierHierarchy: SubscriptionTier[] = ['free', 'explorer', 'traveler', 'enterprise']
    const userTierIndex = tierHierarchy.indexOf(userTier as SubscriptionTier)
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier as SubscriptionTier)

    if (userTierIndex === -1 || requiredTierIndex === -1) {
        return false
    }

    return userTierIndex >= requiredTierIndex
}

/**
 * Get tier display information
 */
export function getTierInfo(tier: SubscriptionTier) {
    const tierInfo = {
        free: { name: 'Free', color: 'gray', price: '$0' },
        explorer: { name: 'Explorer', color: 'blue', price: '$9.99/month' },
        traveler: { name: 'Traveler', color: 'purple', price: '$19.99/month' },
        enterprise: { name: 'Enterprise', color: 'amber', price: 'Custom' }
    }

    return tierInfo[tier] || tierInfo.free
}

/**
 * Route protection helper for pages
 */
export function createRouteProtection(config: {
    requireAuth?: boolean
    requireSubscription?: SubscriptionTier
    requireAdmin?: boolean
}) {
    return {
        requireAuth: config.requireAuth ?? true,
        requireSubscription: config.requireSubscription,
        requireAdmin: config.requireAdmin ?? false
    }
}