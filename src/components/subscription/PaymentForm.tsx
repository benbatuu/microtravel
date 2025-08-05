'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Lock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { SubscriptionTier, formatPrice } from '@/lib/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
    tier: SubscriptionTier
    interval: 'monthly' | 'yearly'
    userId: string
    onSuccess: (sessionId: string) => void
    onError: (error: string) => void
    onCancel: () => void
}

type PaymentFormInnerProps = PaymentFormProps

function PaymentFormInner({
    tier,
    interval,
    userId,
    onError,
    onCancel
}: PaymentFormInnerProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cardComplete, setCardComplete] = useState(false)

    const price = interval === 'yearly' ? tier.priceYearly : tier.priceMonthly
    const monthlyPrice = interval === 'yearly' ? tier.priceYearly / 12 : tier.priceMonthly
    const savings = interval === 'yearly' ?
        ((tier.priceMonthly * 12 - tier.priceYearly) / (tier.priceMonthly * 12)) * 100 : 0

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!stripe || !elements) {
            setError('Stripe has not loaded yet. Please try again.')
            return
        }

        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
            setError('Card element not found. Please refresh the page.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Create checkout session
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tierId: tier.id,
                    interval,
                    userId
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session')
            }

            // Redirect to Stripe Checkout
            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId: data.sessionId
            })

            if (stripeError) {
                throw new Error(stripeError.message)
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
            setError(errorMessage)
            onError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
                fontFamily: 'system-ui, -apple-system, sans-serif',
            },
            invalid: {
                color: '#9e2146',
            },
        },
        hidePostalCode: false,
    }

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Complete Your Subscription
                    </CardTitle>
                    <CardDescription>
                        Subscribe to {tier.name} plan
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Plan Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{tier.name} Plan</span>
                            <Badge variant="secondary">{interval}</Badge>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Price per month</span>
                                <span>{formatPrice(monthlyPrice)}</span>
                            </div>

                            {interval === 'yearly' && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span>Billed yearly</span>
                                        <span>{formatPrice(price)}</span>
                                    </div>
                                    {savings > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>You save</span>
                                            <span>{Math.round(savings)}%</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <Separator />

                        <div className="flex justify-between font-medium">
                            <span>Total {interval === 'yearly' ? 'yearly' : 'monthly'}</span>
                            <span>{formatPrice(price)}</span>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Card Information
                            </label>
                            <div className="border rounded-md p-3 bg-white">
                                <CardElement
                                    options={cardElementOptions}
                                    onChange={(event) => {
                                        setCardComplete(event.complete)
                                        if (event.error) {
                                            setError(event.error.message)
                                        } else {
                                            setError(null)
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Lock className="h-3 w-3" />
                            <span>Your payment information is secure and encrypted</span>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={!stripe || loading || !cardComplete}
                                className="flex-1"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    `Subscribe ${formatPrice(price)}${interval === 'yearly' ? '/year' : '/month'}`
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Features Reminder */}
                    <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Instant access to all features</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>30-day money-back guarantee</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export function PaymentForm(props: PaymentFormProps) {
    return (
        <Elements stripe={stripePromise}>
            <PaymentFormInner {...props} />
        </Elements>
    )
}