import { supabase } from './supabaseClient'
import { UserProfile, SubscriptionTier } from '@/types/auth'

export class AuthError extends Error {
    constructor(message: string, public code?: string) {
        super(message)
        this.name = 'AuthError'
    }
}

export const authUtils = {
    /**
     * Get user profile with subscription information
     */
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching user profile:', error)
                return null
            }

            return data
        } catch (error) {
            console.error('Error in getUserProfile:', error)
            return null
        }
    },

    /**
     * Get subscription tier information
     */
    async getSubscriptionTier(tierId: string): Promise<SubscriptionTier | null> {
        try {
            const { data, error } = await supabase
                .from('subscription_tiers')
                .select('*')
                .eq('id', tierId)
                .single()

            if (error) {
                console.error('Error fetching subscription tier:', error)
                return null
            }

            return data
        } catch (error) {
            console.error('Error in getSubscriptionTier:', error)
            return null
        }
    },

    /**
     * Create user profile after signup
     */
    async createUserProfile(userId: string, email: string, fullName?: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email,
                    full_name: fullName || null,
                    subscription_tier: 'free',
                    subscription_status: 'active',
                    storage_used: 0,
                    is_admin: false
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating user profile:', error)
                return null
            }

            return data
        } catch (error) {
            console.error('Error in createUserProfile:', error)
            return null
        }
    },

    /**
     * Update user profile
     */
    async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single()

            if (error) {
                console.error('Error updating user profile:', error)
                return null
            }

            return data
        } catch (error) {
            console.error('Error in updateUserProfile:', error)
            return null
        }
    },

    /**
     * Check if user has active subscription
     */
    isSubscriptionActive(profile: UserProfile): boolean {
        if (!profile) return false

        // Free tier is always considered active
        if (profile.subscription_tier === 'free') return true

        // Check subscription status
        if (profile.subscription_status !== 'active') return false

        // Check subscription end date if exists
        if (profile.subscription_end_date) {
            const endDate = new Date(profile.subscription_end_date)
            const now = new Date()
            return endDate > now
        }

        return true
    },

    /**
     * Check if user has paid subscription
     */
    hasActiveSubscription(profile: UserProfile): boolean {
        if (!profile) return false
        return profile.subscription_tier !== 'free' && this.isSubscriptionActive(profile)
    },

    /**
     * Get subscription limits based on tier
     */
    getSubscriptionLimits(tier: string): { experiences: number; storage: number; exports: number } {
        const limits = {
            free: { experiences: 5, storage: 50, exports: 1 },
            explorer: { experiences: 50, storage: 500, exports: 10 },
            traveler: { experiences: -1, storage: 5000, exports: -1 }, // -1 means unlimited
            enterprise: { experiences: -1, storage: 50000, exports: -1 }
        }

        return limits[tier as keyof typeof limits] || limits.free
    },

    /**
     * Check if user can perform action based on subscription
     */
    canPerformAction(profile: UserProfile, action: string, currentUsage?: number): boolean {
        if (!profile) return false

        const limits = this.getSubscriptionLimits(profile.subscription_tier)

        switch (action) {
            case 'create_experience':
                return limits.experiences === -1 || (currentUsage || 0) < limits.experiences
            case 'upload_image':
                return limits.storage === -1 || profile.storage_used < limits.storage * 1024 * 1024 // Convert MB to bytes
            case 'export_data':
                return limits.exports === -1 || (currentUsage || 0) < limits.exports
            default:
                return true
        }
    },

    /**
     * Format subscription tier name for display
     */
    formatTierName(tier: string): string {
        const names = {
            free: 'Free',
            explorer: 'Explorer',
            traveler: 'Traveler',
            enterprise: 'Enterprise'
        }

        return names[tier as keyof typeof names] || 'Unknown'
    },

    /**
     * Get tier color for UI
     */
    getTierColor(tier: string): string {
        const colors = {
            free: 'text-gray-600',
            explorer: 'text-blue-600',
            traveler: 'text-purple-600',
            enterprise: 'text-gold-600'
        }

        return colors[tier as keyof typeof colors] || 'text-gray-600'
    }
}