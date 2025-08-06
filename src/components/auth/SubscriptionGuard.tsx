'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Crown, Lock, Zap, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SubscriptionGuardProps {
    children: React.ReactNode
    requiredTier: 'explorer' | 'traveler' | 'enterprise'
    feature: string
    description?: string
    fallback?: React.ReactNode
    showPreview?: boolean
    previewContent?: React.ReactNode
}

const TIER_CONFIG = {
    explorer: {
        name: 'Explorer',
        color: 'blue',
        icon: Zap,
        price: '$9.99/month',
        features: ['50 experiences', '500MB storage', 'Advanced analytics', 'Export data']
    },
    traveler: {
        name: 'Traveler',
        color: 'purple',
        icon: Star,
        price: '$19.99/month',
        features: ['Unlimited experiences', '5GB storage', 'Bulk operations', 'Priority support']
    },
    enterprise: {
        name: 'Enterprise',
        color: 'amber',
        icon: Sparkles,
        price: 'Custom pricing',
        features: ['Everything in Traveler', 'API access', 'Custom integrations', 'Dedicated support']
    }
}

export function SubscriptionGuard({
    children,
    requiredTier,
    feature,
    description,
    fallback,
    showPreview = false,
    previewContent
}: SubscriptionGuardProps) {
    const auth = useAuth()
    const router = useRouter()

    // Check if user has required subscription
    const hasAccess = hasRequiredSubscription(auth.profile?.subscription_tier || 'free', requiredTier)

    if (hasAccess) {
        return <>{children}</>
    }

    // Show fallback if provided
    if (fallback) {
        return <>{fallback}</>
    }

    const tierConfig = TIER_CONFIG[requiredTier]
    const IconComponent = tierConfig.icon
    const currentTier = auth.profile?.subscription_tier || 'free'

    return (
        <div className="space-y-6">
            {/* Preview content if enabled */}
            {showPreview && previewContent && (
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent z-10 flex items-end justify-center pb-8">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                            Preview Mode
                        </Badge>
                    </div>
                    <div className="opacity-50 pointer-events-none">
                        {previewContent}
                    </div>
                </div>
            )}

            {/* Upgrade prompt */}
            <Card className="border-2 border-dashed">
                <CardHeader className="text-center">
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-${tierConfig.color}-100`}>
                        <IconComponent className={`h-8 w-8 text-${tierConfig.color}-600`} />
                    </div>
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Crown className="h-5 w-5 text-amber-500" />
                        {tierConfig.name} Feature
                    </CardTitle>
                    <CardDescription>
                        {description || `${feature} is available with ${tierConfig.name} subscription and above.`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Current vs Required */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                            <Badge variant="outline" className="capitalize">
                                {currentTier}
                            </Badge>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Required Plan</p>
                            <Badge className={`bg-${tierConfig.color}-100 text-${tierConfig.color}-700 hover:bg-${tierConfig.color}-200`}>
                                {tierConfig.name}
                            </Badge>
                        </div>
                    </div>

                    {/* Features list */}
                    <div>
                        <h4 className="font-semibold mb-3">What you'll get with {tierConfig.name}:</h4>
                        <ul className="space-y-2">
                            {tierConfig.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    <div className={`h-1.5 w-1.5 rounded-full bg-${tierConfig.color}-500`} />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pricing */}
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Starting at</p>
                        <p className="text-2xl font-bold text-gray-900">{tierConfig.price}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                        <Button
                            onClick={() => router.push(`/pricing?upgrade=${requiredTier}&feature=${encodeURIComponent(feature)}`)}
                            className="w-full"
                            size="lg"
                        >
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to {tierConfig.name}
                        </Button>
                        <Button
                            onClick={() => router.push('/pricing')}
                            variant="outline"
                            className="w-full"
                        >
                            View All Plans
                        </Button>
                    </div>

                    {/* Additional info */}
                    <p className="text-xs text-gray-500 text-center">
                        30-day money-back guarantee • Cancel anytime
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

// Helper function to check subscription tier hierarchy
function hasRequiredSubscription(userTier: string, requiredTier: string): boolean {
    const tierHierarchy = ['free', 'explorer', 'traveler', 'enterprise']
    const userTierIndex = tierHierarchy.indexOf(userTier)
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier)

    if (userTierIndex === -1 || requiredTierIndex === -1) {
        return false
    }

    return userTierIndex >= requiredTierIndex
}

// Convenience components for specific tiers
export function RequireExplorer({ children, feature, ...props }: Omit<SubscriptionGuardProps, 'requiredTier'>) {
    return (
        <SubscriptionGuard requiredTier="explorer" feature={feature} {...props}>
            {children}
        </SubscriptionGuard>
    )
}

export function RequireTraveler({ children, feature, ...props }: Omit<SubscriptionGuardProps, 'requiredTier'>) {
    return (
        <SubscriptionGuard requiredTier="traveler" feature={feature} {...props}>
            {children}
        </SubscriptionGuard>
    )
}

export function RequireEnterprise({ children, feature, ...props }: Omit<SubscriptionGuardProps, 'requiredTier'>) {
    return (
        <SubscriptionGuard requiredTier="enterprise" feature={feature} {...props}>
            {children}
        </SubscriptionGuard>
    )
}

// Feature gate component for inline feature gating
export function FeatureGate({
    children,
    requiredTier,
    feature,
    fallback,
    showUpgradeButton = true
}: {
    children: React.ReactNode
    requiredTier: 'explorer' | 'traveler' | 'enterprise'
    feature: string
    fallback?: React.ReactNode
    showUpgradeButton?: boolean
}) {
    const auth = useAuth()
    const router = useRouter()

    const hasAccess = hasRequiredSubscription(auth.profile?.subscription_tier || 'free', requiredTier)

    if (hasAccess) {
        return <>{children}</>
    }

    if (fallback) {
        return <>{fallback}</>
    }

    const tierConfig = TIER_CONFIG[requiredTier]

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Lock className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{feature}</p>
                <p className="text-xs text-gray-500">Requires {tierConfig.name} subscription</p>
            </div>
            {showUpgradeButton && (
                <Button
                    size="sm"
                    onClick={() => router.push(`/pricing?upgrade=${requiredTier}&feature=${encodeURIComponent(feature)}`)}
                >
                    Upgrade
                </Button>
            )}
        </div>
    )
}