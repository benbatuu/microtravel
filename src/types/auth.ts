import { User } from '@supabase/supabase-js'

export interface UserProfile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    subscription_tier: string
    subscription_status: string
    stripe_customer_id: string | null
    subscription_end_date: string | null
    storage_used: number
    is_admin: boolean | null
    admin_role: string | null
    admin_permissions: string[] | null
    last_admin_login: string | null
    created_at: string
    updated_at: string
}

export interface SubscriptionTier {
    id: string
    name: string
    price_monthly: number
    price_yearly: number
    features: Record<string, unknown>
    limits: {
        experiences: number
        storage: number // in MB
        exports: number
    }
    stripe_product_id: string | null
    stripe_price_id_monthly: string | null
    stripe_price_id_yearly: string | null
}

export interface AuthState {
    user: User | null
    profile: UserProfile | null
    subscription: SubscriptionTier | null
    loading: boolean
    isAuthenticated: boolean
    isSubscribed: boolean
    hasActiveSubscription: boolean
}

export interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ error: Error | null }>
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
    refreshProfile: () => Promise<void>
    checkSubscriptionStatus: () => Promise<void>
}