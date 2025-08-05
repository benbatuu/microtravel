import { NextRequest, NextResponse } from 'next/server'
import { stripe, subscriptionTiers } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseClient'

// Get subscription details
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing user ID' },
                { status: 400 }
            )
        }

        // Get subscription from database
        const { data: subscription, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (error || !subscription) {
            return NextResponse.json(
                { subscription: null },
                { status: 200 }
            )
        }

        // Get detailed info from Stripe if needed
        let stripeSubscription = null
        if (subscription.stripe_subscription_id) {
            try {
                stripeSubscription = await stripe.subscriptions.retrieve(
                    subscription.stripe_subscription_id
                )
            } catch (stripeError) {
                console.error('Error fetching Stripe subscription:', stripeError)
            }
        }

        return NextResponse.json({
            subscription: {
                ...subscription,
                stripe_details: stripeSubscription
            }
        })
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return NextResponse.json(
            { error: 'Failed to fetch subscription' },
            { status: 500 }
        )
    }
}

// Update subscription (upgrade/downgrade)
export async function PUT(request: NextRequest) {
    try {
        const { userId, newTierId, interval } = await request.json()

        if (!userId || !newTierId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // Get current subscription
        const { data: currentSub, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_subscription_id, tier')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (subError || !currentSub || !currentSub.stripe_subscription_id) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            )
        }

        // Get Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(
            currentSub.stripe_subscription_id
        )

        // Update subscription in Stripe
        const updatedSubscription = await stripe.subscriptions.update(
            currentSub.stripe_subscription_id,
            {
                items: [{
                    id: stripeSubscription.items.data[0].id,
                    price: interval === 'yearly' ?
                        subscriptionTiers[newTierId].stripePriceIdYearly :
                        subscriptionTiers[newTierId].stripePriceIdMonthly
                }],
                metadata: {
                    ...stripeSubscription.metadata,
                    tier: newTierId
                },
                proration_behavior: 'create_prorations'
            }
        )

        return NextResponse.json({
            success: true,
            subscription: updatedSubscription
        })
    } catch (error) {
        console.error('Error updating subscription:', error)
        return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
        )
    }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
    try {
        const { userId, cancelAtPeriodEnd = true } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing user ID' },
                { status: 400 }
            )
        }

        // Get current subscription
        const { data: currentSub, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_subscription_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (subError || !currentSub || !currentSub.stripe_subscription_id) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            )
        }

        // Cancel subscription in Stripe
        const updatedSubscription = await stripe.subscriptions.update(
            currentSub.stripe_subscription_id,
            {
                cancel_at_period_end: cancelAtPeriodEnd
            }
        )

        return NextResponse.json({
            success: true,
            subscription: updatedSubscription
        })
    } catch (error) {
        console.error('Error canceling subscription:', error)
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        )
    }
}