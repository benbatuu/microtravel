import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key (for admin operations)
export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

// Database types for better TypeScript support
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
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
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    subscription_tier?: string
                    subscription_status?: string
                    stripe_customer_id?: string | null
                    subscription_end_date?: string | null
                    storage_used?: number
                    is_admin?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    subscription_tier?: string
                    subscription_status?: string
                    stripe_customer_id?: string | null
                    subscription_end_date?: string | null
                    storage_used?: number
                    is_admin?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    stripe_subscription_id: string | null
                    stripe_customer_id: string | null
                    tier: string
                    status: string
                    current_period_start: string | null
                    current_period_end: string | null
                    cancel_at_period_end: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    stripe_subscription_id?: string | null
                    stripe_customer_id?: string | null
                    tier: string
                    status: string
                    current_period_start?: string | null
                    current_period_end?: string | null
                    cancel_at_period_end?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    stripe_subscription_id?: string | null
                    stripe_customer_id?: string | null
                    tier?: string
                    status?: string
                    current_period_start?: string | null
                    current_period_end?: string | null
                    cancel_at_period_end?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            payment_history: {
                Row: {
                    id: string
                    user_id: string
                    stripe_payment_intent_id: string | null
                    amount: number
                    currency: string
                    status: string
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    stripe_payment_intent_id?: string | null
                    amount: number
                    currency?: string
                    status: string
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    stripe_payment_intent_id?: string | null
                    amount?: number
                    currency?: string
                    status?: string
                    description?: string | null
                    created_at?: string
                }
            }
            usage_tracking: {
                Row: {
                    id: string
                    user_id: string
                    feature: string
                    usage_count: number
                    date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    feature: string
                    usage_count?: number
                    date?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    feature?: string
                    usage_count?: number
                    date?: string
                    created_at?: string
                }
            }
            subscription_tiers: {
                Row: {
                    id: string
                    name: string
                    price_monthly: number
                    price_yearly: number
                    features: Record<string, unknown>
                    limits: Record<string, unknown>
                    stripe_product_id: string | null
                    stripe_price_id_monthly: string | null
                    stripe_price_id_yearly: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    price_monthly: number
                    price_yearly: number
                    features: Record<string, unknown>
                    limits: Record<string, unknown>
                    stripe_product_id?: string | null
                    stripe_price_id_monthly?: string | null
                    stripe_price_id_yearly?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    price_monthly?: number
                    price_yearly?: number
                    features?: Record<string, unknown>
                    limits?: Record<string, unknown>
                    stripe_product_id?: string | null
                    stripe_price_id_monthly?: string | null
                    stripe_price_id_yearly?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}