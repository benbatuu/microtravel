/* eslint-disable @typescript-eslint/no-explicit-any */
import { stripe, subscriptionTiers } from './stripe'
import { supabaseAdmin } from './supabaseClient'
import { handleStripeError, PaymentRetryManager } from './payment-errors'

export interface SubscriptionWorkflowResult {
    success: boolean
    data?: any
    error?: {
        code: string
        message: string
        userMessage: string
        action: 'retry' | 'upgrade' | 'contact_support' | 'update_payment_method'
    }
}

export interface SubscriptionChangePreview {
    currentTier: string
    newTier: string
    isUpgrade: boolean
    prorationAmount: number
    nextBillingDate: Date
    immediateCharge: boolean
    creditAmount: number
    newMonthlyPrice: number
    newBillingAmount: number
    interval: 'monthly' | 'yearly'
}

const retryManager = new PaymentRetryManager()

/**
 * Handle subscription upgrade with prorated billing
 */
export async function upgradeSubscription(
    userId: string,
    newTierId: string,
    interval: 'monthly' | 'yearly'
): Promise<SubscriptionWorkflowResult> {
    try {
        const result = await retryManager.executeWithRetry(
            async () => {
                // Get current subscription
                const { data: currentSub } = await supabaseAdmin
                    .from('subscriptions')
                    .select('stripe_subscription_id, tier, status')
                    .eq('user_id', userId)
                    .eq('status', 'active')
                    .single()

                if (!currentSub?.stripe_subscription_id) {
                    throw new Error('No active subscription found')
                }

                const newTier = subscriptionTiers[newTierId]
                if (!newTier) {
                    throw new Error('Invalid tier specified')
                }

                // Get Stripe subscription
                const stripeSubscription = await stripe.subscriptions.retrieve(
                    currentSub.stripe_subscription_id
                )

                // Calculate new price
                const newPrice = interval === 'yearly' ? newTier.priceYearly : newTier.priceMonthly

                // Create new price in Stripe
                const price = await stripe.prices.create({
                    currency: 'usd',
                    unit_amount: newPrice,
                    recurring: {
                        interval: interval === 'yearly' ? 'year' : 'month'
                    },
                    product_data: {
                        name: `${newTier.name} Plan`,
                        metadata: { tier: newTierId }
                    },
                    metadata: { tier: newTierId, interval }
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
                            interval
                        },
                        proration_behavior: 'create_prorations'
                    }
                )

                // Update database
                await Promise.all([
                    supabaseAdmin
                        .from('subscriptions')
                        .update({
                            tier: newTierId,
                            current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('stripe_subscription_id', currentSub.stripe_subscription_id),

                    supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: newTierId,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', userId)
                ])

                return updatedSubscription
            },
            { userId, operation: 'upgrade_subscription' }
        )

        return {
            success: true,
            data: result
        }
    } catch (error) {
        const errorDetails = handleStripeError(error)
        return {
            success: false,
            error: errorDetails
        }
    }
}

/**
 * Handle subscription downgrade (at end of billing period)
 */
export async function downgradeSubscription(
    userId: string,
    newTierId: string,
    interval: 'monthly' | 'yearly',
    immediate: boolean = false
): Promise<SubscriptionWorkflowResult> {
    try {
        const result = await retryManager.executeWithRetry(
            async () => {
                const { data: currentSub } = await supabaseAdmin
                    .from('subscriptions')
                    .select('stripe_subscription_id, tier')
                    .eq('user_id', userId)
                    .eq('status', 'active')
                    .single()

                if (!currentSub?.stripe_subscription_id) {
                    throw new Error('No active subscription found')
                }

                const newTier = subscriptionTiers[newTierId]
                if (!newTier) {
                    throw new Error('Invalid tier specified')
                }

                if (immediate) {
                    // Immediate downgrade with proration
                    return await upgradeSubscription(userId, newTierId, interval)
                } else {
                    // Schedule downgrade at end of period
                    const stripeSubscription = await stripe.subscriptions.retrieve(
                        currentSub.stripe_subscription_id
                    )

                    // Create new price for the downgrade
                    const newPrice = interval === 'yearly' ? newTier.priceYearly : newTier.priceMonthly
                    const price = await stripe.prices.create({
                        currency: 'usd',
                        unit_amount: newPrice,
                        recurring: {
                            interval: interval === 'yearly' ? 'year' : 'month'
                        },
                        product_data: {
                            name: `${newTier.name} Plan`,
                            metadata: { tier: newTierId }
                        },
                        metadata: { tier: newTierId, interval }
                    })

                    // Schedule the change for end of period
                    const scheduledUpdate = await stripe.subscriptionSchedules.create({
                        from_subscription: currentSub.stripe_subscription_id,
                        phases: [
                            {
                                items: [{
                                    price: stripeSubscription.items.data[0].price.id,
                                    quantity: 1
                                }],
                                start_date: stripeSubscription.current_period_start,
                                end_date: stripeSubscription.current_period_end
                            },
                            {
                                items: [{
                                    price: price.id,
                                    quantity: 1
                                }],
                                start_date: stripeSubscription.current_period_end
                            }
                        ]
                    })

                    // Update database to reflect scheduled change
                    await supabaseAdmin
                        .from('subscriptions')
                        .update({
                            updated_at: new Date().toISOString()
                        })
                        .eq('stripe_subscription_id', currentSub.stripe_subscription_id)

                    return scheduledUpdate
                }
            },
            { userId, operation: 'downgrade_subscription' }
        )

        return {
            success: true,
            data: result
        }
    } catch (error) {
        const errorDetails = handleStripeError(error)
        return {
            success: false,
            error: errorDetails
        }
    }
}

/**
 * Cancel subscription with end-of-period access
 */
export async function cancelSubscription(
    userId: string,
    cancelAtPeriodEnd: boolean = true
): Promise<SubscriptionWorkflowResult> {
    try {
        const result = await retryManager.executeWithRetry(
            async () => {
                const { data: currentSub } = await supabaseAdmin
                    .from('subscriptions')
                    .select('stripe_subscription_id')
                    .eq('user_id', userId)
                    .eq('status', 'active')
                    .single()

                if (!currentSub?.stripe_subscription_id) {
                    throw new Error('No active subscription found')
                }

                let updatedSubscription
                if (cancelAtPeriodEnd) {
                    // Cancel at end of period
                    updatedSubscription = await stripe.subscriptions.update(
                        currentSub.stripe_subscription_id,
                        { cancel_at_period_end: true }
                    )
                } else {
                    // Cancel immediately
                    updatedSubscription = await stripe.subscriptions.cancel(
                        currentSub.stripe_subscription_id
                    )
                }

                // Update database
                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        cancel_at_period_end: cancelAtPeriodEnd,
                        status: cancelAtPeriodEnd ? 'active' : 'canceled',
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_subscription_id', currentSub.stripe_subscription_id)

                if (!cancelAtPeriodEnd) {
                    // If immediate cancellation, downgrade to free
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: 'free',
                            subscription_status: 'canceled',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', userId)
                }

                return updatedSubscription
            },
            { userId, operation: 'cancel_subscription' }
        )

        return {
            success: true,
            data: result
        }
    } catch (error) {
        const errorDetails = handleStripeError(error)
        return {
            success: false,
            error: errorDetails
        }
    }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(userId: string): Promise<SubscriptionWorkflowResult> {
    try {
        const result = await retryManager.executeWithRetry(
            async () => {
                const { data: currentSub } = await supabaseAdmin
                    .from('subscriptions')
                    .select('stripe_subscription_id, tier')
                    .eq('user_id', userId)
                    .single()

                if (!currentSub?.stripe_subscription_id) {
                    throw new Error('No subscription found')
                }

                // Reactivate by removing cancel_at_period_end
                const updatedSubscription = await stripe.subscriptions.update(
                    currentSub.stripe_subscription_id,
                    { cancel_at_period_end: false }
                )

                // Update database
                await Promise.all([
                    supabaseAdmin
                        .from('subscriptions')
                        .update({
                            cancel_at_period_end: false,
                            status: 'active',
                            updated_at: new Date().toISOString()
                        })
                        .eq('stripe_subscription_id', currentSub.stripe_subscription_id),

                    supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: currentSub.tier,
                            subscription_status: 'active',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', userId)
                ])

                return updatedSubscription
            },
            { userId, operation: 'reactivate_subscription' }
        )

        return {
            success: true,
            data: result
        }
    } catch (error) {
        const errorDetails = handleStripeError(error)
        return {
            success: false,
            error: errorDetails
        }
    }
}

/**
 * Handle payment failure with retry logic
 */
export async function handlePaymentFailure(
    userId: string,
    subscriptionId: string,
    invoiceId: string
): Promise<SubscriptionWorkflowResult> {
    try {
        const result = await retryManager.executeWithRetry(
            async () => {
                // Get invoice details
                const invoice = await stripe.invoices.retrieve(invoiceId)

                if (invoice.status === 'paid') {
                    return { message: 'Invoice already paid' }
                }

                // Attempt to pay the invoice
                const paidInvoice = await stripe.invoices.pay(invoiceId)

                // Log successful payment recovery
                await supabaseAdmin
                    .from('payment_history')
                    .insert({
                        user_id: userId,
                        stripe_payment_intent_id: paidInvoice.payment_intent as string,
                        amount: paidInvoice.amount_paid || 0,
                        currency: paidInvoice.currency,
                        status: 'succeeded',
                        description: 'Payment retry successful'
                    })

                return paidInvoice
            },
            { userId, operation: 'retry_payment' }
        )

        return {
            success: true,
            data: result
        }
    } catch (error) {
        const errorDetails = handleStripeError(error)

        // Log failed retry attempt
        await supabaseAdmin
            .from('payment_history')
            .insert({
                user_id: userId,
                amount: 0,
                currency: 'usd',
                status: 'failed',
                description: `Payment retry failed: ${errorDetails.message}`
            })

        return {
            success: false,
            error: errorDetails
        }
    }
}

/**
 * Get subscription change preview
 */
export async function getSubscriptionChangePreview(
    userId: string,
    newTierId: string,
    interval: 'monthly' | 'yearly'
): Promise<SubscriptionWorkflowResult> {
    try {
        const { data: currentSub } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_subscription_id, tier')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (!currentSub?.stripe_subscription_id) {
            return {
                success: false,
                error: {
                    code: 'NO_SUBSCRIPTION',
                    message: 'No active subscription found',
                    userMessage: 'No active subscription found',
                    action: 'contact_support'
                }
            }
        }

        const newTier = subscriptionTiers[newTierId]
        const currentTier = subscriptionTiers[currentSub.tier]

        if (!newTier || !currentTier) {
            return {
                success: false,
                error: {
                    code: 'INVALID_TIER',
                    message: 'Invalid tier specified',
                    userMessage: 'Invalid subscription plan',
                    action: 'retry'
                }
            }
        }

        // Get Stripe subscription
        const stripeSubscription = await stripe.subscriptions.retrieve(
            currentSub.stripe_subscription_id
        )

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

        try {
            // Get upcoming invoice preview
            const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
                customer: stripeSubscription.customer as string,
                subscription: currentSub.stripe_subscription_id,
                subscription_items: [{
                    id: stripeSubscription.items.data[0].id,
                    price: tempPrice.id
                }],
                subscription_proration_behavior: 'create_prorations'
            })

            const preview: SubscriptionChangePreview = {
                currentTier: currentTier.name,
                newTier: newTier.name,
                isUpgrade: newTier.priceMonthly > currentTier.priceMonthly,
                prorationAmount: upcomingInvoice.amount_due,
                nextBillingDate: new Date(upcomingInvoice.period_end * 1000),
                immediateCharge: upcomingInvoice.amount_due > 0,
                creditAmount: upcomingInvoice.amount_due < 0 ? Math.abs(upcomingInvoice.amount_due) : 0,
                newMonthlyPrice: interval === 'yearly' ? newTier.priceYearly / 12 : newTier.priceMonthly,
                newBillingAmount: newPrice,
                interval
            }

            return {
                success: true,
                data: preview
            }
        } finally {
            // Clean up temporary price
            await stripe.prices.update(tempPrice.id, { active: false })
        }
    } catch (error) {
        const errorDetails = handleStripeError(error)
        return {
            success: false,
            error: errorDetails
        }
    }
}