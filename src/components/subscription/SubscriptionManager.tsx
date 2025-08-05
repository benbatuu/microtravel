/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    CreditCard,
    AlertCircle,
    CheckCircle,
    ExternalLink,
    Zap,
    Star,
    Crown,
    Settings
} from 'lucide-react'
import { subscriptionTiers } from '@/lib/stripe'
import { PricingCard } from './PricingCard'

interface SubscriptionData {
    id: string
    user_id: string
    stripe_subscription_id: string | null
    stripe_customer_id: string | null
    tier: string
    status: string
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    created_at: string
    updated_at: string
    stripe_details?: any
}

interface SubscriptionManagerProps {
    userId: string
    currentSubscription?: SubscriptionData | null
    onSubscriptionChange?: () => void
}

const tierIcons = {
    free: null,
    explorer: <Zap className="h-5 w-5 text-blue-500" />,
    traveler: <Star className="h-5 w-5 text-purple-500" />,
    enterprise: <Crown className="h-5 w-5 text-amber-500" />
}

export function SubscriptionManager({
    userId,
    currentSubscription,
    onSubscriptionChange
}: SubscriptionManagerProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
    const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly')

    const currentTier = currentSubscription ? subscriptionTiers[currentSubscription.tier] : subscriptionTiers.free
    const isCanceling = currentSubscription?.cancel_at_period_end || false

    const handleManageBilling = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/stripe/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create billing portal session')
            }

            // Redirect to Stripe billing portal
            window.location.href = data.url
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to open billing portal'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelSubscription = async () => {
        if (!currentSubscription?.stripe_subscription_id) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/stripe/subscription', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    cancelAtPeriodEnd: true
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to cancel subscription')
            }

            onSubscriptionChange?.()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleReactivateSubscription = async () => {
        if (!currentSubscription?.stripe_subscription_id) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/stripe/subscription', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    cancelAtPeriodEnd: false
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reactivate subscription')
            }

            onSubscriptionChange?.()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate subscription'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleUpgrade = async (tierId: string, interval: 'monthly' | 'yearly') => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tierId,
                    interval,
                    userId
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session')
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start upgrade process'
            setError(errorMessage)
        } finally {
            setLoading(false)
            setShowUpgradeDialog(false)
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusBadge = () => {
        if (!currentSubscription || currentSubscription.tier === 'free') {
            return <Badge variant="secondary">Free</Badge>
        }

        if (isCanceling) {
            return <Badge variant="destructive">Canceling</Badge>
        }

        switch (currentSubscription.status) {
            case 'active':
                return <Badge variant="default" className="bg-green-500">Active</Badge>
            case 'past_due':
                return <Badge variant="destructive">Past Due</Badge>
            case 'canceled':
                return <Badge variant="secondary">Canceled</Badge>
            case 'incomplete':
                return <Badge variant="secondary">Incomplete</Badge>
            default:
                return <Badge variant="secondary">{currentSubscription.status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Current Subscription Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {tierIcons[currentTier?.id as keyof typeof tierIcons]}
                            <span>Current Plan: {currentTier?.name}</span>
                        </div>
                        {getStatusBadge()}
                    </CardTitle>
                    <CardDescription>
                        {currentTier?.id === 'free'
                            ? 'You are currently on the free plan'
                            : `You have access to all ${currentTier?.name} features`
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {currentSubscription && currentSubscription.tier !== 'free' && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Billing Period</span>
                                <div className="font-medium">
                                    {formatDate(currentSubscription.current_period_start)} - {formatDate(currentSubscription.current_period_end)}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600">Next Billing Date</span>
                                <div className="font-medium">
                                    {isCanceling ? 'Subscription ends' : 'Renews on'} {formatDate(currentSubscription.current_period_end)}
                                </div>
                            </div>
                        </div>
                    )}

                    {isCanceling && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Your subscription will be canceled at the end of the current billing period.
                                You will continue to have access to premium features until
                                {formatDate(currentSubscription?.current_period_end || null)}.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Separator />

                    <div className="flex flex-wrap gap-3">
                        {currentTier?.id !== 'enterprise' && (
                            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="default">
                                        <Zap className="h-4 w-4 mr-2" />
                                        {currentTier?.id === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Choose Your Plan</DialogTitle>
                                        <DialogDescription>
                                            Select a plan that fits your needs. You can change or cancel anytime.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6">
                                        {/* Billing Toggle */}
                                        <div className="flex items-center justify-center gap-4">
                                            <span className={selectedInterval === 'monthly' ? 'font-medium' : 'text-gray-600'}>
                                                Monthly
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedInterval(selectedInterval === 'monthly' ? 'yearly' : 'monthly')}
                                                className="relative"
                                            >
                                                <div className={`w-12 h-6 rounded-full transition-colors ${selectedInterval === 'yearly' ? 'bg-blue-500' : 'bg-gray-300'
                                                    }`}>
                                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${selectedInterval === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'
                                                        }`} />
                                                </div>
                                            </Button>
                                            <span className={selectedInterval === 'yearly' ? 'font-medium' : 'text-gray-600'}>
                                                Yearly
                                                <Badge variant="secondary" className="ml-2 text-xs">Save 17%</Badge>
                                            </span>
                                        </div>

                                        {/* Pricing Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {Object.values(subscriptionTiers).map((tier) => (
                                                <PricingCard
                                                    key={tier.id}
                                                    tier={tier}
                                                    interval={selectedInterval}
                                                    isCurrentTier={tier.id === currentTier?.id}
                                                    isPopular={tier.id === 'traveler'}
                                                    onSelectPlan={handleUpgrade}
                                                    loading={loading}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}

                        {currentSubscription && currentSubscription.tier !== 'free' && (
                            <Button
                                variant="outline"
                                onClick={handleManageBilling}
                                disabled={loading}
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Manage Billing
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                        )}

                        {currentSubscription && currentSubscription.tier !== 'free' && !isCanceling && (
                            <Button
                                variant="outline"
                                onClick={handleCancelSubscription}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700"
                            >
                                Cancel Subscription
                            </Button>
                        )}

                        {isCanceling && (
                            <Button
                                variant="outline"
                                onClick={handleReactivateSubscription}
                                disabled={loading}
                                className="text-green-600 hover:text-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Reactivate Subscription
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Usage Summary */}
            {currentTier && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Plan Limits & Usage
                        </CardTitle>
                        <CardDescription>
                            Your current usage and plan limits
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {currentTier.limits.experiences === -1 ? '∞' : currentTier.limits.experiences}
                                </div>
                                <div className="text-sm text-gray-600">Experiences</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {currentTier.limits.storage === -1 ? '∞' :
                                        currentTier.limits.storage >= 1000000000 ? `${(currentTier.limits.storage / 1000000000).toFixed(1)}GB` :
                                            `${(currentTier.limits.storage / 1000000).toFixed(0)}MB`}
                                </div>
                                <div className="text-sm text-gray-600">Storage</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {currentTier.limits.exports === -1 ? '∞' : currentTier.limits.exports}
                                </div>
                                <div className="text-sm text-gray-600">Monthly Exports</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}