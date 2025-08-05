import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { subscriptionTiers } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        const { tierId, interval, userId } = await request.json()

        if (!tierId || !interval || !userId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        const tier = subscriptionTiers[tierId]
        if (!tier) {
            return NextResponse.json(
                { error: 'Invalid tier ID' },
                { status: 400 }
            )
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('email, stripe_customer_id')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        let customerId = profile.stripe_customer_id

        // Create or retrieve Stripe customer
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: profile.email,
                metadata: {
                    userId: userId
                }
            })
            customerId = customer.id

            // Update profile with customer ID
            await supabaseAdmin
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', userId)
        }

        // Determine price based on interval
        const priceAmount = interval === 'yearly' ? tier.priceYearly : tier.priceMonthly

        // Create checkout session
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
                userId: userId,
                tier: tierId
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    tier: tierId
                }
            }
        })

        return NextResponse.json({ sessionId: session.id })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}