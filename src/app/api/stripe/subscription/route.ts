import { NextRequest, NextResponse } from 'next/server'
import { stripe, subscriptionTiers } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { withErrorHandler } from '@/lib/api-error-handler'
import { DatabaseErrorRecovery } from '@/lib/database-error-recovery'
import { log } from '@/lib/logger'

// Get subscription details
export const GET = withErrorHandler(async (request: NextRequest) => {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        log.warn('GET /api/stripe/subscription - Missing user ID', {
            component: 'API',
            action: 'get_subscription'
        })
        throw new Error('Missing user ID')
    }

    log.info('Fetching subscription details', {
        component: 'API',
        action: 'get_subscription',
        userId
    })

    // Get subscription from database with retry logic
    const subscription = await DatabaseErrorRecovery.queryWithRecovery(
        supabaseAdmin,
        'subscriptions',
        (query) => query
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()
    )

    if (!subscription) {
        log.info('No active subscription found', {
            component: 'API',
            action: 'get_subscription',
            userId
        })
        return NextResponse.json({ subscription: null }, { status: 200 })
    }

    // Get detailed info from Stripe if needed
    let stripeSubscription = null
    if (subscription.stripe_subscription_id) {
        try {
            stripeSubscription = await stripe.subscriptions.retrieve(
                subscription.stripe_subscription_id
            )
            log.debug('Retrieved Stripe subscription details', {
                component: 'Stripe',
                action: 'retrieve_subscription',
                subscriptionId: subscription.stripe_subscription_id
            })
        } catch (stripeError) {
            log.error('Failed to fetch Stripe subscription details', {
                component: 'Stripe',
                action: 'retrieve_subscription',
                subscriptionId: subscription.stripe_subscription_id
            }, stripeError)
        }
    }

    const duration = Date.now() - startTime
    log.apiRequest('GET', '/api/stripe/subscription', 200, duration, { userId })

    return NextResponse.json({
        subscription: {
            ...subscription,
            stripe_details: stripeSubscription
        }
    })
})

// Update subscription (upgrade/downgrade)
export const PUT = withErrorHandler(async (request: NextRequest) => {
    const startTime = Date.now()
    const { userId, newTierId, interval } = await request.json()

    if (!userId || !newTierId) {
        log.warn('PUT /api/stripe/subscription - Missing required parameters', {
            component: 'API',
            action: 'update_subscription',
            userId,
            newTierId
        })
        throw new Error('Missing required parameters')
    }

    log.info('Updating subscription', {
        component: 'API',
        action: 'update_subscription',
        userId,
        newTierId,
        interval
    })

    // Get current subscription with retry logic
    const currentSub = await DatabaseErrorRecovery.queryWithRecovery(
        supabaseAdmin,
        'subscriptions',
        (query) => query
            .select('stripe_subscription_id, tier')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()
    )

    if (!currentSub || !currentSub.stripe_subscription_id) {
        log.warn('No active subscription found for update', {
            component: 'API',
            action: 'update_subscription',
            userId
        })
        throw new Error('No active subscription found')
    }

    // Get Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
        currentSub.stripe_subscription_id
    )

    log.debug('Retrieved current Stripe subscription', {
        component: 'Stripe',
        action: 'retrieve_subscription',
        subscriptionId: currentSub.stripe_subscription_id,
        currentTier: currentSub.tier
    })

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

    log.payment('subscription_updated', undefined, undefined, true)

    const duration = Date.now() - startTime
    log.apiRequest('PUT', '/api/stripe/subscription', 200, duration, {
        userId,
        oldTier: currentSub.tier,
        newTier: newTierId
    })

    return NextResponse.json({
        success: true,
        subscription: updatedSubscription
    })
})

// Cancel subscription
export const DELETE = withErrorHandler(async (request: NextRequest) => {
    const startTime = Date.now()
    const { userId, cancelAtPeriodEnd = true } = await request.json()

    if (!userId) {
        log.warn('DELETE /api/stripe/subscription - Missing user ID', {
            component: 'API',
            action: 'cancel_subscription'
        })
        throw new Error('Missing user ID')
    }

    log.info('Canceling subscription', {
        component: 'API',
        action: 'cancel_subscription',
        userId,
        cancelAtPeriodEnd
    })

    // Get current subscription with retry logic
    const currentSub = await DatabaseErrorRecovery.queryWithRecovery(
        supabaseAdmin,
        'subscriptions',
        (query) => query
            .select('stripe_subscription_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()
    )

    if (!currentSub || !currentSub.stripe_subscription_id) {
        log.warn('No active subscription found for cancellation', {
            component: 'API',
            action: 'cancel_subscription',
            userId
        })
        throw new Error('No active subscription found')
    }

    // Cancel subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
        currentSub.stripe_subscription_id,
        {
            cancel_at_period_end: cancelAtPeriodEnd
        }
    )

    log.payment('subscription_canceled', undefined, undefined, true)

    const duration = Date.now() - startTime
    log.apiRequest('DELETE', '/api/stripe/subscription', 200, duration, {
        userId,
        cancelAtPeriodEnd
    })

    return NextResponse.json({
        success: true,
        subscription: updatedSubscription
    })
})