/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseClient'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()
        const signature = headersList.get('stripe-signature')

        if (!signature) {
            console.error('Missing Stripe signature')
            return NextResponse.json(
                { error: 'Missing Stripe signature' },
                { status: 400 }
            )
        }

        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
            console.error('Webhook signature verification failed:', err)
            return NextResponse.json(
                { error: 'Webhook signature verification failed' },
                { status: 400 }
            )
        }

        // Handle the event
        switch (event.type) {
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
                break

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
                break

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
                break

            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
                break

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.Invoice)
                break

            case 'invoice.payment_action_required':
                await handlePaymentActionRequired(event.data.object as Stripe.Invoice)
                break

            case 'customer.subscription.trial_will_end':
                await handleTrialWillEnd(event.data.object as Stripe.Subscription)
                break

            case 'invoice.upcoming':
                await handleUpcomingInvoice(event.data.object as Stripe.Invoice)
                break

            case 'payment_method.attached':
                await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
                break

            case 'setup_intent.succeeded':
                await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent)
                break

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}

async function findUserByEmail(email: string) {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    return profile
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
        const customerId = subscription.customer as string
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

        if (!customer.email) {
            console.error('Customer email not found')
            return
        }

        const profile = await findUserByEmail(customer.email)
        if (!profile) {
            console.error('User not found for email:', customer.email)
            return
        }

        const tier = getTierFromSubscription(subscription)

        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_tier: tier,
                subscription_status: subscription.status,
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

        await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: profile.id,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: customerId,
                tier,
                status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end || false
            })

        console.log('Subscription created successfully for user:', profile.id)
    } catch (error) {
        console.error('Error handling subscription created:', error)
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
        const tier = getTierFromSubscription(subscription)

        const { data: subscriptionRecord } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

        if (!subscriptionRecord) {
            console.error('Subscription record not found:', subscription.id)
            return
        }

        await supabaseAdmin
            .from('subscriptions')
            .update({
                tier,
                status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end || false,
                updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_tier: tier,
                subscription_status: subscription.status,
                updated_at: new Date().toISOString()
            })
            .eq('id', subscriptionRecord.user_id)

        console.log('Subscription updated successfully for user:', subscriptionRecord.user_id)
    } catch (error) {
        console.error('Error handling subscription updated:', error)
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
        const { data: subscriptionRecord } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

        if (!subscriptionRecord) {
            console.error('Subscription record not found:', subscription.id)
            return
        }

        await supabaseAdmin
            .from('subscriptions')
            .update({
                status: 'canceled',
                updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_tier: 'free',
                subscription_status: 'canceled',
                updated_at: new Date().toISOString()
            })
            .eq('id', subscriptionRecord.user_id)

        console.log('Subscription deleted successfully for user:', subscriptionRecord.user_id)
    } catch (error) {
        console.error('Error handling subscription deleted:', error)
    }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
        const customerId = invoice.customer as string
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

        if (!customer.email) {
            console.error('Customer email not found')
            return
        }

        const profile = await findUserByEmail(customer.email)
        if (!profile) {
            console.error('User not found for email:', customer.email)
            return
        }

        await supabaseAdmin
            .from('payment_history')
            .insert({
                user_id: profile.id,
                amount: invoice.amount_paid || 0,
                currency: invoice.currency,
                status: 'succeeded',
                description: invoice.description || 'Subscription payment'
            })

        console.log('Payment succeeded recorded for user:', profile.id)
    } catch (error) {
        console.error('Error handling payment succeeded:', error)
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    try {
        const customerId = invoice.customer as string
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

        if (!customer.email) {
            console.error('Customer email not found')
            return
        }

        const profile = await findUserByEmail(customer.email)
        if (!profile) {
            console.error('User not found for email:', customer.email)
            return
        }

        // Record failed payment
        await supabaseAdmin
            .from('payment_history')
            .insert({
                user_id: profile.id,
                stripe_payment_intent_id: (invoice as any).payment_intent as string,
                amount: invoice.amount_due || 0,
                currency: invoice.currency,
                status: 'failed',
                description: 'Failed subscription payment'
            })

        // Get subscription details
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_subscription_id, tier')
            .eq('user_id', profile.id)
            .eq('stripe_customer_id', customerId)
            .single()

        if (subscription) {
            // Update subscription status to indicate payment issues
            await supabaseAdmin
                .from('subscriptions')
                .update({
                    status: 'past_due',
                    updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscription.stripe_subscription_id)

            // Update profile subscription status
            await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_status: 'past_due',
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)

            // TODO: Send email notification about payment failure
            // TODO: Implement retry logic after grace period
        }

        console.log('Payment failed recorded for user:', profile.id)
    } catch (error) {
        console.error('Error handling payment failed:', error)
    }
}

async function handlePaymentActionRequired(invoice: Stripe.Invoice) {
    try {
        const customerId = invoice.customer as string
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

        if (!customer.email) {
            console.error('Customer email not found')
            return
        }

        const profile = await findUserByEmail(customer.email)
        if (!profile) {
            console.error('User not found for email:', customer.email)
            return
        }

        // Update subscription status to indicate action required
        await supabaseAdmin
            .from('subscriptions')
            .update({
                status: 'incomplete',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', profile.id)

        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_status: 'incomplete',
                updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

        // TODO: Send email notification about required payment action
        console.log('Payment action required for user:', profile.id)
    } catch (error) {
        console.error('Error handling payment action required:', error)
    }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
    try {
        const customerId = subscription.customer as string
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

        if (!customer.email) {
            console.error('Customer email not found')
            return
        }

        const profile = await findUserByEmail(customer.email)
        if (!profile) {
            console.error('User not found for email:', customer.email)
            return
        }

        // TODO: Send trial ending notification email
        console.log('Trial will end for user:', profile.id)
    } catch (error) {
        console.error('Error handling trial will end:', error)
    }
}

async function handleUpcomingInvoice(invoice: Stripe.Invoice) {
    try {
        const customerId = invoice.customer as string
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

        if (!customer.email) {
            console.error('Customer email not found')
            return
        }

        const profile = await findUserByEmail(customer.email)
        if (!profile) {
            console.error('User not found for email:', customer.email)
            return
        }

        // TODO: Send upcoming invoice notification email
        console.log('Upcoming invoice for user:', profile.id, 'Amount:', invoice.amount_due)
    } catch (error) {
        console.error('Error handling upcoming invoice:', error)
    }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
    try {
        const customerId = paymentMethod.customer as string
        if (!customerId) return

        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        if (!customer.email) {
            console.error('Customer email not found')
            return
        }

        const profile = await findUserByEmail(customer.email)
        if (!profile) {
            console.error('User not found for email:', customer.email)
            return
        }

        console.log('Payment method attached for user:', profile.id)
    } catch (error) {
        console.error('Error handling payment method attached:', error)
    }
}

async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    try {
        const customerId = setupIntent.customer as string
        if (!customerId) return

        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        if (!customer.email) {
            console.error('Customer email not found')
            return
        }

        const profile = await findUserByEmail(customer.email)
        if (!profile) {
            console.error('User not found for email:', customer.email)
            return
        }

        console.log('Setup intent succeeded for user:', profile.id)
    } catch (error) {
        console.error('Error handling setup intent succeeded:', error)
    }
}

function getTierFromSubscription(subscription: Stripe.Subscription): string {
    if (subscription.metadata?.tier) {
        return subscription.metadata.tier
    }

    const amount = subscription.items.data[0]?.price.unit_amount || 0

    if (amount === 0) return 'free'
    if (amount <= 999) return 'explorer'
    if (amount <= 1999) return 'traveler'
    return 'enterprise'
}