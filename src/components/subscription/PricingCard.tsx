'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Star, Crown } from 'lucide-react'
import { SubscriptionTier, formatPrice } from '@/lib/stripe'

interface PricingCardProps {
    tier: SubscriptionTier
    interval: 'monthly' | 'yearly'
    isCurrentTier?: boolean
    isPopular?: boolean
    onSelectPlan: (tierId: string, interval: 'monthly' | 'yearly') => void
    loading?: boolean
    disabled?: boolean
}

const tierIcons = {
    free: null,
    explorer: <Zap className="h-5 w-5" />,
    traveler: <Star className="h-5 w-5" />,
    enterprise: <Crown className="h-5 w-5" />
}

const tierColors = {
    free: 'border-gray-200',
    explorer: 'border-blue-200 bg-blue-50/50',
    traveler: 'border-purple-200 bg-purple-50/50',
    enterprise: 'border-amber-200 bg-amber-50/50'
}

export function PricingCard({
    tier,
    interval,
    isCurrentTier = false,
    isPopular = false,
    onSelectPlan,
    loading = false,
    disabled = false
}: PricingCardProps) {
    const price = interval === 'yearly' ? tier.priceYearly : tier.priceMonthly
    const monthlyPrice = interval === 'yearly' ? tier.priceYearly / 12 : tier.priceMonthly
    const savings = interval === 'yearly' ?
        ((tier.priceMonthly * 12 - tier.priceYearly) / (tier.priceMonthly * 12)) * 100 : 0

    const handleSelectPlan = () => {
        if (!disabled && !loading) {
            onSelectPlan(tier.id, interval)
        }
    }

    const formatLimit = (limit: number) => {
        if (limit === -1) return 'Unlimited'
        if (limit >= 1000000000) return `${(limit / 1000000000).toFixed(1)}GB`
        if (limit >= 1000000) return `${(limit / 1000000).toFixed(0)}MB`
        return limit.toString()
    }

    return (
        <Card className={`relative transition-all duration-200 hover:shadow-lg ${tierColors[tier.id as keyof typeof tierColors]} ${isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
            }`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                        Most Popular
                    </Badge>
                </div>
            )}

            <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    {tierIcons[tier.id as keyof typeof tierIcons]}
                    <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                </div>

                <div className="space-y-1">
                    <div className="text-3xl font-bold">
                        {price === 0 ? 'Free' : formatPrice(monthlyPrice)}
                        {price > 0 && <span className="text-sm font-normal text-gray-600">/month</span>}
                    </div>

                    {interval === 'yearly' && price > 0 && (
                        <div className="text-sm text-gray-600">
                            {formatPrice(price)} billed yearly
                            {savings > 0 && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    Save {Math.round(savings)}%
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                <CardDescription className="text-sm text-gray-600 mt-2">
                    Perfect for {tier.id === 'free' ? 'getting started' :
                        tier.id === 'explorer' ? 'casual travelers' :
                            tier.id === 'traveler' ? 'frequent travelers' :
                                'businesses and teams'}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Usage Limits */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Experiences</span>
                        <span className="font-medium">{formatLimit(tier.limits.experiences)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Storage</span>
                        <span className="font-medium">{formatLimit(tier.limits.storage)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monthly Exports</span>
                        <span className="font-medium">{formatLimit(tier.limits.exports)}</span>
                    </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Features included:</h4>
                    <ul className="space-y-1">
                        {tier.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={handleSelectPlan}
                    disabled={disabled || loading || isCurrentTier}
                    className={`w-full ${isCurrentTier
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : isPopular
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : ''
                        }`}
                    variant={isCurrentTier ? 'secondary' : isPopular ? 'default' : 'outline'}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </div>
                    ) : isCurrentTier ? (
                        'Current Plan'
                    ) : tier.id === 'free' ? (
                        'Get Started'
                    ) : (
                        `Upgrade to ${tier.name}`
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}