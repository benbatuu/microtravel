/**
 * API connectivity testing utilities
 * Used to verify environment configuration and API connections
 */

import { supabase, supabaseAdmin } from './supabaseClient'
import Stripe from 'stripe'

export interface APITestResult {
    service: string
    status: 'success' | 'error'
    message: string
    details?: any
}

/**
 * Test Supabase client connection
 */
export async function testSupabaseConnection(): Promise<APITestResult> {
    try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1)

        if (error) {
            return {
                service: 'Supabase Client',
                status: 'error',
                message: 'Failed to connect to Supabase',
                details: error
            }
        }

        return {
            service: 'Supabase Client',
            status: 'success',
            message: 'Successfully connected to Supabase'
        }
    } catch (error) {
        return {
            service: 'Supabase Client',
            status: 'error',
            message: 'Connection error',
            details: error
        }
    }
}

/**
 * Test Supabase admin connection
 */
export async function testSupabaseAdminConnection(): Promise<APITestResult> {
    try {
        const { data, error } = await supabaseAdmin.from('profiles').select('count').limit(1)

        if (error) {
            return {
                service: 'Supabase Admin',
                status: 'error',
                message: 'Failed to connect with service role key',
                details: error
            }
        }

        return {
            service: 'Supabase Admin',
            status: 'success',
            message: 'Successfully connected with service role key'
        }
    } catch (error) {
        return {
            service: 'Supabase Admin',
            status: 'error',
            message: 'Admin connection error',
            details: error
        }
    }
}

/**
 * Test Stripe connection
 */
export async function testStripeConnection(): Promise<APITestResult> {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return {
                service: 'Stripe',
                status: 'error',
                message: 'STRIPE_SECRET_KEY not configured'
            }
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-06-20'
        })

        // Test by retrieving account information
        const account = await stripe.accounts.retrieve()

        return {
            service: 'Stripe',
            status: 'success',
            message: `Successfully connected to Stripe (${account.business_type || 'test'} account)`
        }
    } catch (error: any) {
        return {
            service: 'Stripe',
            status: 'error',
            message: 'Failed to connect to Stripe',
            details: error.message
        }
    }
}

/**
 * Test all API connections
 */
export async function testAllConnections(): Promise<APITestResult[]> {
    const results = await Promise.all([
        testSupabaseConnection(),
        testSupabaseAdminConnection(),
        testStripeConnection()
    ])

    return results
}

/**
 * Validate environment variables
 */
export function validateEnvironmentVariables(): APITestResult {
    const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'NEXT_PUBLIC_APP_URL'
    ]

    const missing = requiredVars.filter(varName => !process.env[varName])

    if (missing.length > 0) {
        return {
            service: 'Environment Variables',
            status: 'error',
            message: `Missing required environment variables: ${missing.join(', ')}`
        }
    }

    // Check for placeholder values
    const placeholders = [
        { key: 'SUPABASE_SERVICE_ROLE_KEY', placeholder: 'your_service_role_key_here' },
        { key: 'JWT_SECRET', placeholder: 'your_jwt_secret_here' }
    ]

    const hasPlaceholders = placeholders.filter(({ key, placeholder }) =>
        process.env[key] === placeholder
    )

    if (hasPlaceholders.length > 0) {
        return {
            service: 'Environment Variables',
            status: 'error',
            message: `Placeholder values detected: ${hasPlaceholders.map(p => p.key).join(', ')}`
        }
    }

    return {
        service: 'Environment Variables',
        status: 'success',
        message: 'All required environment variables are configured'
    }
}