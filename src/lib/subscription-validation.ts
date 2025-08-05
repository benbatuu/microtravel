import { subscriptionTiers, SubscriptionTier } from './stripe'
import { supabaseAdmin } from './supabaseClient'

export interface ValidationResult {
    isValid: boolean
    tier: SubscriptionTier | null
    errors: string[]
    warnings: string[]
}

export interface UsageValidation {
    canPerformAction: boolean
    currentUsage: number
    limit: number
    remaining: number
    requiresUpgrade: boolean
    suggestedTier?: string
}

/**
 * Validate subscription tier configuration
 */
export function validateSubscriptionTier(tierId: string): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        tier: null,
        errors: [],
        warnings: []
    }

    const tier = subscriptionTiers[tierId]

    if (!tier) {
        result.isValid = false
        result.errors.push(`Invalid tier ID: ${tierId}`)
        return result
    }

    result.tier = tier

    // Validate pricing
    if (tier.priceMonthly < 0) {
        result.errors.push('Monthly price cannot be negative')
        result.isValid = false
    }

    if (tier.priceYearly < 0) {
        result.errors.push('Yearly price cannot be negative')
        result.isValid = false
    }

    // Validate limits
    if (tier.limits.experiences < -1) {
        result.errors.push('Experience limit must be -1 (unlimited) or positive number')
        result.isValid = false
    }

    if (tier.limits.storage < -1) {
        result.errors.push('Storage limit must be -1 (unlimited) or positive number')
        result.isValid = false
    }

    if (tier.limits.exports < -1) {
        result.errors.push('Export limit must be -1 (unlimited) or positive number')
        result.isValid = false
    }

    // Validate features
    if (!tier.features || tier.features.length === 0) {
        result.warnings.push('No features defined for tier')
    }

    // Validate Stripe configuration
    if (!tier.stripeProductId) {
        result.warnings.push('No Stripe product ID configured')
    }

    return result
}

/**
 * Validate all subscription tiers
 */
export function validateAllTiers(): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    for (const tierId of Object.keys(subscriptionTiers)) {
        results[tierId] = validateSubscriptionTier(tierId)
    }

    return results
}

/**
 * Check if user can perform an action based on their subscription
 */
export async function validateUserAction(
    userId: string,
    action: 'create_experience' | 'upload_image' | 'export_data',
    additionalUsage: number = 1
): Promise<UsageValidation> {
    try {
        // Get user's current subscription
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('subscription_tier, storage_used')
            .eq('id', userId)
            .single()

        if (!profile) {
            return {
                canPerformAction: false,
                currentUsage: 0,
                limit: 0,
                remaining: 0,
                requiresUpgrade: true,
                suggestedTier: 'explorer'
            }
        }

        const tier = subscriptionTiers[profile.subscription_tier || 'free']
        if (!tier) {
            return {
                canPerformAction: false,
                currentUsage: 0,
                limit: 0,
                remaining: 0,
                requiresUpgrade: true,
                suggestedTier: 'explorer'
            }
        }

        let currentUsage = 0
        let limit = 0
        let limitType: keyof SubscriptionTier['limits']

        switch (action) {
            case 'create_experience':
                // Count current experiences
                const { count: experienceCount } = await supabaseAdmin
                    .from('experiences')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)

                currentUsage = experienceCount || 0
                limit = tier.limits.experiences
                limitType = 'experiences'
                break

            case 'upload_image':
                currentUsage = profile.storage_used || 0
                limit = tier.limits.storage
                limitType = 'storage'
                break

            case 'export_data':
                // Count exports this month
                const startOfMonth = new Date()
                startOfMonth.setDate(1)
                startOfMonth.setHours(0, 0, 0, 0)

                const { count: exportCount } = await supabaseAdmin
                    .from('usage_tracking')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('feature', 'export')
                    .gte('created_at', startOfMonth.toISOString())

                currentUsage = exportCount || 0
                limit = tier.limits.exports
                limitType = 'exports'
                break
        }

        // -1 means unlimited
        if (limit === -1) {
            return {
                canPerformAction: true,
                currentUsage,
                limit: -1,
                remaining: -1,
                requiresUpgrade: false
            }
        }

        const remaining = Math.max(0, limit - currentUsage)
        const canPerformAction = currentUsage + additionalUsage <= limit

        // Suggest upgrade tier if needed
        let suggestedTier: string | undefined
        if (!canPerformAction) {
            const tierHierarchy = ['free', 'explorer', 'traveler', 'enterprise']
            const currentTierIndex = tierHierarchy.indexOf(profile.subscription_tier || 'free')

            for (let i = currentTierIndex + 1; i < tierHierarchy.length; i++) {
                const nextTier = subscriptionTiers[tierHierarchy[i]]
                const nextLimit = nextTier.limits[limitType]

                if (nextLimit === -1 || currentUsage + additionalUsage <= nextLimit) {
                    suggestedTier = tierHierarchy[i]
                    break
                }
            }
        }

        return {
            canPerformAction,
            currentUsage,
            limit,
            remaining,
            requiresUpgrade: !canPerformAction,
            suggestedTier
        }
    } catch (error) {
        console.error('Error validating user action:', error)
        return {
            canPerformAction: false,
            currentUsage: 0,
            limit: 0,
            remaining: 0,
            requiresUpgrade: true,
            suggestedTier: 'explorer'
        }
    }
}

/**
 * Track usage for billing and limits
 */
export async function trackUsage(
    userId: string,
    feature: string,
    usageCount: number = 1
): Promise<boolean> {
    try {
        const today = new Date().toISOString().split('T')[0]

        // Check if usage record exists for today
        const { data: existingUsage } = await supabaseAdmin
            .from('usage_tracking')
            .select('id, usage_count')
            .eq('user_id', userId)
            .eq('feature', feature)
            .eq('date', today)
            .single()

        if (existingUsage) {
            // Update existing record
            await supabaseAdmin
                .from('usage_tracking')
                .update({
                    usage_count: existingUsage.usage_count + usageCount
                })
                .eq('id', existingUsage.id)
        } else {
            // Create new record
            await supabaseAdmin
                .from('usage_tracking')
                .insert({
                    user_id: userId,
                    feature,
                    usage_count: usageCount,
                    date: today
                })
        }

        return true
    } catch (error) {
        console.error('Error tracking usage:', error)
        return false
    }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: string): Promise<{
    experiences: number
    storage: number
    exportsThisMonth: number
    tier: SubscriptionTier | null
}> {
    try {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('subscription_tier, storage_used')
            .eq('id', userId)
            .single()

        const tier = profile ? subscriptionTiers[profile.subscription_tier || 'free'] : null

        // Count experiences
        const { count: experienceCount } = await supabaseAdmin
            .from('experiences')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        // Count exports this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count: exportCount } = await supabaseAdmin
            .from('usage_tracking')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('feature', 'export')
            .gte('created_at', startOfMonth.toISOString())

        return {
            experiences: experienceCount || 0,
            storage: profile?.storage_used || 0,
            exportsThisMonth: exportCount || 0,
            tier
        }
    } catch (error) {
        console.error('Error getting usage stats:', error)
        return {
            experiences: 0,
            storage: 0,
            exportsThisMonth: 0,
            tier: null
        }
    }
}

/**
 * Check if subscription is active and valid
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
    try {
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('status, current_period_end')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (!subscription) {
            return false
        }

        // Check if subscription hasn't expired
        if (subscription.current_period_end) {
            const endDate = new Date(subscription.current_period_end)
            const now = new Date()
            return endDate > now
        }

        return subscription.status === 'active'
    } catch (error) {
        console.error('Error checking subscription status:', error)
        return false
    }
}