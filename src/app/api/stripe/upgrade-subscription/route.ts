/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { stripe, subscriptionTiers } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { handleStripeError } from '@/lib/payment-errors'

export async function POST(request: NextRequest) {
    try {
        const { userId, newTierId, interval } = await request.json()

        if (!userId || !newTierId || !interval) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        const newTier = subscriptionTiers[newTierId]
        if (!newTier) {
            return NextResponse.json(
                { error: 'Invalid tier ID' },
                { status: 400 }
            )
        }

        // Get current subscription
        const { data: currentSub, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_subscription_id, tier, status')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (subError || !currentSub || !currentSub.stripe_subscription_id) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            )
        }

        // Get Stripe subscription details
        const stripeSubscription = await stripe.subscriptions.retrieve(
            currentSub.stripe_subscription_id
        )

        if (!stripeSubscription) {
            return NextResponse.json(
                { error: 'Stripe subscription not found' },
                { status: 404 }
            )
        }

        // Calculate new price
        const newPrice = interval === 'yearly' ? newTier.priceYearly : newTier.priceMonthly

        // Create new price object in Stripe
        const price = await stripe.prices.create({
            currency: 'usd',
            unit_amount: newPrice,
            recurring: {
                interval: interval === 'yearly' ? 'year' : 'month'
            },
            product_data: {
                name: `${newTier.name} Plan`,
                metadata: {
                    tier: newTierId
                }
            },
            metadata: {
                tier: newTierId,
                interval: interval
            }
        })

        // Update subscription with proration
        const updatedSubscription = await stripe.subscriptions.update(
            currentSub.stripe_subscription_id,
            {
                items: [{
                    id: stripeSubscription.items.data[0].id,
                    price: price.id
                }],
                metadata: {
                    ...stripeSubscription.metadata,
                    tier: newTierId,
                    interval: interval
                },
                proration_behavior: 'create_prorations'
            }
        )

        // Update database records
        await supabaseAdmin
            .from('subscriptions')
            .update({
                tier: newTierId,
                current_period_start: new Date((updatedSubscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
                current_period_end: new Date((updatedSubscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', currentSub.stripe_subscription_id)

        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_tier: newTierId,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        return NextResponse.json({
            success: true,
            subscription: updatedSubscription,
            message: `Successfully ${newTier.priceMonthly > subscriptionTiers[currentSub.tier].priceMonthly ? 'upgraded' : 'downgraded'} to ${newTier.name} plan`
        })

    } catch (error) {
        console.error('Error upgrading subscription:', error)
        const errorDetails = handleStripeError(error)

        return NextResponse.json(
            {
                error: errorDetails.userMessage,
                code: errorDetails.code
            },
            { status: 500 }
        )
    }
}

// Get upgrade preview with proration calculation
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const newTierId = searchParams.get('newTierId')
        const interval = searchParams.get('interval')

        if (!userId || !newTierId || !interval) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        const newTier = subscriptionTiers[newTierId]
        if (!newTier) {
            return NextResponse.json(
                { error: 'Invalid tier ID' },
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

        // Calculate new price
        const newPrice = interval === 'yearly' ? newTier.priceYearly : newTier.priceMonthly

        // Create temporary price for preview
        const tempPrice = await stripe.prices.create({
            currency: 'usd',
            unit_amount: newPrice,
            recurring: {
                interval: interval === 'yearly' ? 'year' : 'month'
            },
            product_data: {
                name: `${newTier.name} Plan (Preview)`
            }
        })

        // Get upcoming invoice preview
        // TODO: Fix Stripe invoice preview method
        const upcomingInvoice: { amount_due: number; period_end: number } | null = null
        // const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        //     customer: stripeSubscription.customer as string,
        //     subscription: currentSub.stripe_subscription_id,
        //     subscription_items: [{
        //         id: stripeSubscription.items.data[0].id,
        //         price: tempPrice.id
        //     }],
        //     subscription_proration_behavior: 'create_prorations'
        // })

        // Clean up temporary price
        await stripe.prices.update(tempPrice.id, { active: false })

        const currentTier = subscriptionTiers[currentSub.tier]
        const isUpgrade = newTier.priceMonthly > currentTier.priceMonthly

        return NextResponse.json({
            success: true,
            preview: {
                currentTier: currentTier.name,
                newTier: newTier.name,
                isUpgrade,
                prorationAmount: (upcomingInvoice as any)?.amount_due || 0,
                nextBillingDate: upcomingInvoice ? new Date((upcomingInvoice as any).period_end * 1000) : new Date(),
                immediateCharge: ((upcomingInvoice as any)?.amount_due || 0) > 0,
                creditAmount: ((upcomingInvoice as any)?.amount_due || 0) < 0 ? Math.abs((upcomingInvoice as any).amount_due || 0) : 0,
                newMonthlyPrice: interval === 'yearly' ? newTier.priceYearly / 12 : newTier.priceMonthly,
                newBillingAmount: newPrice,
                interval
            }
        })

    } catch (error) {
        console.error('Error getting upgrade preview:', error)
        const errorDetails = handleStripeError(error)

        return NextResponse.json(
            {
                error: errorDetails.userMessage,
                code: errorDetails.code
            },
            { status: 500 }
        )
    }
}