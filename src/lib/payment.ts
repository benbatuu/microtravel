/* eslint-disable @typescript-eslint/no-explicit-any */
import { stripe, subscriptionTiers } from './stripe'
import { supabaseAdmin } from './supabaseClient'

export interface PaymentError {
    code: string
    message: string
    userMessage: string
    action?: 'retry' | 'upgrade' | 'contact_support'
}

export interface PaymentResult {
    success: boolean
    data?: any
    error?: PaymentError
}

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(
    userId: string,
    email: string,
    name?: string
): Promise<PaymentResult> {
    try {
        const customer = await stripe.customers.create({
            email,
            name,
            metadata: {
                userId
            }
        })

        // Update user profile with customer ID
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                stripe_customer_id: customer.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (updateError) {
            throw new Error(`Failed to update profile: ${updateError.message}`)
        }

        return {
            success: true,
            data: customer
        }
    } catch (error) {
        console.error('Error creating Stripe customer:', error)
        return {
            success: false,
            error: {
                code: 'CUSTOMER_CREATION_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Failed to set up payment account. Please try again.',
                action: 'retry'
            }
        }
    }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
    userId: string,
    tierId: string,
    interval: 'monthly' | 'yearly'
): Promise<PaymentResult> {
    try {
        const tier = subscriptionTiers[tierId]
        if (!tier) {
            return {
                success: false,
                error: {
                    code: 'INVALID_TIER',
                    message: 'Invalid subscription tier',
                    userMessage: 'Invalid subscription plan selected.',
                    action: 'retry'
                }
            }
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('email, stripe_customer_id')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            return {
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User profile not found',
                    userMessage: 'Account not found. Please try logging in again.',
                    action: 'retry'
                }
            }
        }

        let customerId = profile.stripe_customer_id

        // Create customer if doesn't exist
        if (!customerId) {
            const customerResult = await createStripeCustomer(userId, profile.email)
            if (!customerResult.success) {
                return customerResult
            }
            customerId = customerResult.data.id
        }

        const priceAmount = interval === 'yearly' ? tier.priceYearly : tier.priceMonthly

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${tier.name} Plan`,
                            description: tier.features.join(', ')
                        },
                        unit_amount: priceAmount,
                        recurring: {
                            interval: interval === 'yearly' ? 'year' : 'month'
                        }
                    },
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            metadata: {
                userId,
                tier: tierId
            },
            subscription_data: {
                metadata: {
                    userId,
                    tier: tierId
                }
            }
        })

        return {
            success: true,
            data: { sessionId: session.id, url: session.url }
        }
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return {
            success: false,
            error: {
                code: 'CHECKOUT_CREATION_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Failed to start checkout process. Please try again.',
                action: 'retry'
            }
        }
    }
}

/**
 * Create a billing portal session
 */
export async function createPortalSession(userId: string): Promise<PaymentResult> {
    try {
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single()

        if (profileError || !profile || !profile.stripe_customer_id) {
            return {
                success: false,
                error: {
                    code: 'CUSTOMER_NOT_FOUND',
                    message: 'Stripe customer not found',
                    userMessage: 'No billing account found. Please contact support.',
                    action: 'contact_support'
                }
            }
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        })

        return {
            success: true,
            data: { url: session.url }
        }
    } catch (error) {
        console.error('Error creating portal session:', error)
        return {
            success: false,
            error: {
                code: 'PORTAL_CREATION_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Failed to access billing portal. Please try again.',
                action: 'retry'
            }
        }
    }
}

/**
 * Get subscription details for a user
 */
export async function getUserSubscription(userId: string): Promise<PaymentResult> {
    try {
        const { data: subscription, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            throw error
        }

        let stripeSubscription = null
        if (subscription?.stripe_subscription_id) {
            try {
                stripeSubscription = await stripe.subscriptions.retrieve(
                    subscription.stripe_subscription_id
                )
            } catch (stripeError) {
                console.error('Error fetching Stripe subscription:', stripeError)
            }
        }

        return {
            success: true,
            data: {
                subscription,
                stripeDetails: stripeSubscription
            }
        }
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return {
            success: false,
            error: {
                code: 'SUBSCRIPTION_FETCH_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Failed to load subscription details.',
                action: 'retry'
            }
        }
    }
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(userId: string): Promise<PaymentResult> {
    try {
        const { data: payments, error } = await supabaseAdmin
            .from('payment_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return {
            success: true,
            data: payments || []
        }
    } catch (error) {
        console.error('Error fetching payment history:', error)
        return {
            success: false,
            error: {
                code: 'PAYMENT_HISTORY_FETCH_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Failed to load payment history.',
                action: 'retry'
            }
        }
    }
}

/**
 * Handle payment retry logic
 */
export async function retryFailedPayment(
    subscriptionId: string,
    paymentMethodId?: string
): Promise<PaymentResult> {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        if (!subscription.latest_invoice) {
            return {
                success: false,
                error: {
                    code: 'NO_INVOICE_FOUND',
                    message: 'No invoice found for subscription',
                    userMessage: 'No pending payment found.',
                    action: 'contact_support'
                }
            }
        }

        const invoice = await stripe.invoices.retrieve(
            subscription.latest_invoice as string
        )

        if (invoice.status === 'paid') {
            return {
                success: true,
                data: { message: 'Payment already completed' }
            }
        }

        // Update payment method if provided
        if (paymentMethodId) {
            await stripe.subscriptions.update(subscriptionId, {
                default_payment_method: paymentMethodId
            })
        }

        // Retry the payment
        const paidInvoice = await stripe.invoices.pay(invoice.id)

        return {
            success: true,
            data: paidInvoice
        }
    } catch (error) {
        console.error('Error retrying payment:', error)
        return {
            success: false,
            error: {
                code: 'PAYMENT_RETRY_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Payment retry failed. Please check your payment method.',
                action: 'retry'
            }
        }
    }
}

/**
 * Validate subscription tier access
 */
export function validateTierAccess(
    userTier: string,
    requiredTier: string
): { hasAccess: boolean; upgradeRequired: boolean } {
    const tierHierarchy = ['free', 'explorer', 'traveler', 'enterprise']
    const userTierIndex = tierHierarchy.indexOf(userTier)
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier)

    const hasAccess = userTierIndex >= requiredTierIndex
    const upgradeRequired = !hasAccess && requiredTierIndex > userTierIndex

    return { hasAccess, upgradeRequired }
}

/**
 * Calculate prorated amount for subscription changes
 */
export async function calculateProration(
    subscriptionId: string,
    newTierId: string,
    interval: 'monthly' | 'yearly'
): Promise<PaymentResult> {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const newTier = subscriptionTiers[newTierId]

        if (!newTier) {
            return {
                success: false,
                error: {
                    code: 'INVALID_TIER',
                    message: 'Invalid tier specified',
                    userMessage: 'Invalid subscription plan.',
                    action: 'retry'
                }
            }
        }

        const newPrice = interval === 'yearly' ? newTier.priceYearly : newTier.priceMonthly

        // Create a preview of the subscription change
        const preview = await stripe.invoices.retrieveUpcoming({
            customer: subscription.customer as string,
            subscription: subscriptionId,
            subscription_items: [{
                id: subscription.items.data[0].id,
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${newTier.name} Plan`
                    },
                    unit_amount: newPrice,
                    recurring: {
                        interval: interval === 'yearly' ? 'year' : 'month'
                    }
                }
            }],
            subscription_proration_behavior: 'create_prorations'
        })

        return {
            success: true,
            data: {
                prorationAmount: preview.amount_due,
                nextBillingDate: new Date(preview.period_end * 1000),
                preview
            }
        }
    } catch (error) {
        console.error('Error calculating proration:', error)
        return {
            success: false,
            error: {
                code: 'PRORATION_CALCULATION_FAILED',
                message: error instanceof Error ? error.message : 'Unknown error',
                userMessage: 'Failed to calculate pricing. Please try again.',
                action: 'retry'
            }
        }
    }
}