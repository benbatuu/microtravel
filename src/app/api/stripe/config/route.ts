import { NextResponse } from 'next/server'
import { subscriptionTiers } from '@/lib/stripe'

export async function GET() {
    try {
        // Return public configuration data (no sensitive keys)
        return NextResponse.json({
            success: true,
            tiers: Object.values(subscriptionTiers).map(tier => ({
                id: tier.id,
                name: tier.name,
                priceMonthly: tier.priceMonthly,
                priceYearly: tier.priceYearly,
                features: tier.features,
                limits: tier.limits
            })),
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'configured' : 'missing'
        })
    } catch (error) {
        console.error('Stripe config error:', error)
        return NextResponse.json(
            { success: false, error: 'Configuration error' },
            { status: 500 }
        )
    }
}