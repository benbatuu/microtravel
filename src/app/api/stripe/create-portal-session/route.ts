import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing user ID' },
                { status: 400 }
            )
        }

        // Get user profile with Stripe customer ID
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single()

        if (profileError || !profile || !profile.stripe_customer_id) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Error creating portal session:', error)
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        )
    }
}