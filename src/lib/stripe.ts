import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
    typescript: true,
})

// Client-side Stripe instance
let stripePromise: ReturnType<typeof loadStripe> | null = null

export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    }
    return stripePromise
}

// Subscription tier configuration
export interface SubscriptionTier {
    id: string
    name: string
    priceMonthly: number // in cents
    priceYearly: number // in cents
    features: string[]
    limits: {
        experiences: number // -1 for unlimited
        storage: number // in bytes, -1 for unlimited
        exports: number // -1 for unlimited
    }
    stripeProductId: string
    stripePriceIdMonthly?: string
    stripePriceIdYearly?: string
}

export const subscriptionTiers: Record<string, SubscriptionTier> = {
    free: {
        id: 'free',
        name: 'Free',
        priceMonthly: 0,
        priceYearly: 0,
        features: [
            'Basic experience sharing',
            '5 experiences',
            'Community support'
        ],
        limits: {
            experiences: 5,
            storage: 52428800, // 50MB
            exports: 1
        },
        stripeProductId: 'prod_free'
    },
    explorer: {
        id: 'explorer',
        name: 'Explorer',
        priceMonthly: 999, // $9.99
        priceYearly: 9990, // $99.90 (2 months free)
        features: [
            'Advanced features',
            '50 experiences',
            'Email support',
            'Export capabilities'
        ],
        limits: {
            experiences: 50,
            storage: 524288000, // 500MB
            exports: 10
        },
        stripeProductId: 'prod_explorer'
    },
    traveler: {
        id: 'traveler',
        name: 'Traveler',
        priceMonthly: 1999, // $19.99
        priceYearly: 19990, // $199.90 (2 months free)
        features: [
            'Premium features',
            'Unlimited experiences',
            'Priority support',
            'Advanced analytics'
        ],
        limits: {
            experiences: -1, // unlimited
            storage: 5368709120, // 5GB
            exports: -1 // unlimited
        },
        stripeProductId: 'prod_traveler'
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        priceMonthly: 4999, // $49.99
        priceYearly: 49990, // $499.90 (2 months free)
        features: [
            'All features',
            'Custom limits',
            'Dedicated support',
            'API access',
            'White-label options'
        ],
        limits: {
            experiences: -1, // unlimited
            storage: -1, // unlimited
            exports: -1 // unlimited
        },
        stripeProductId: 'prod_enterprise'
    }
}

// Helper function to format price for display
export function formatPrice(priceInCents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(priceInCents / 100)
}

// Helper function to get tier by ID
export function getTier(tierId: string): SubscriptionTier | null {
    return subscriptionTiers[tierId] || null
}

// Helper function to check if user can access feature based on tier
export function canAccessFeature(userTier: string, requiredTier: string): boolean {
    const tierHierarchy = ['free', 'explorer', 'traveler', 'enterprise']
    const userTierIndex = tierHierarchy.indexOf(userTier)
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier)

    return userTierIndex >= requiredTierIndex
}

// Helper function to check usage limits
export function checkUsageLimit(
    userTier: string,
    limitType: keyof SubscriptionTier['limits'],
    currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
    const tier = getTier(userTier)
    if (!tier) {
        return { allowed: false, limit: 0, remaining: 0 }
    }

    const limit = tier.limits[limitType]

    // -1 means unlimited
    if (limit === -1) {
        return { allowed: true, limit: -1, remaining: -1 }
    }

    const remaining = Math.max(0, limit - currentUsage)
    return {
        allowed: currentUsage < limit,
        limit,
        remaining
    }
}