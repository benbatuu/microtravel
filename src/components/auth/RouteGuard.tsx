'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Lock, Crown, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RouteGuardProps {
    children: React.ReactNode
    requireAuth?: boolean
    requireSubscription?: string
    requireAdmin?: boolean
    fallback?: React.ReactNode
    redirectTo?: string
    showUpgradePrompt?: boolean
    customMessage?: string
}

export function RouteGuard({
    children,
    requireAuth = true,
    requireSubscription,
    requireAdmin = false,
    fallback,
    redirectTo,
    showUpgradePrompt = true,
    customMessage
}: RouteGuardProps) {
    const auth = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get any error or context from URL params
    const reason = searchParams.get('reason')
    const message = searchParams.get('message')
    const requiredTier = searchParams.get('required')
    const currentTier = searchParams.get('current')
    const feature = searchParams.get('feature')

    // Show loading state while auth is initializing
    if (auth.loading) {
        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Verifying access...</p>
                    </div>
                </div>
            )
        )
    }

    // Check authentication requirement
    if (requireAuth && !auth.isAuthenticated) {
        if (redirectTo) {
            router.push(redirectTo)
            return null
        }

        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Lock className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle>Authentication Required</CardTitle>
                            <CardDescription>
                                {customMessage || message || 'You need to be signed in to access this page.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {reason === 'middleware_error' && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        There was an issue verifying your access. Please try signing in again.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Button
                                    onClick={() => router.push('/auth/login')}
                                    className="w-full"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    onClick={() => router.push('/auth/signup')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Create Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        )
    }

    // Check subscription requirement
    if (requireSubscription && !hasRequiredSubscription(auth.profile?.subscription_tier || 'free', requireSubscription)) {
        return (
            fallback || (
                <SubscriptionUpgradePrompt
                    requiredTier={requiredTier || requireSubscription}
                    currentTier={currentTier || auth.profile?.subscription_tier || 'free'}
                    feature={feature || 'this feature'}
                    customMessage={customMessage || message}
                    showUpgradePrompt={showUpgradePrompt}
                />
            )
        )
    }

    // Check admin requirement
    if (requireAdmin && !auth.profile?.is_admin) {
        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <Shield className="h-6 w-6 text-red-600" />
                            </div>
                            <CardTitle>Access Denied</CardTitle>
                            <CardDescription>
                                {customMessage || message || 'You don\'t have permission to access this page.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => router.push('/dashboard')}
                                className="w-full"
                            >
                                Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
        )
    }

    // All checks passed, render children
    return <>{children}</>
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

// Subscription upgrade prompt component
function SubscriptionUpgradePrompt({
    requiredTier,
    currentTier,
    feature,
    customMessage,
    showUpgradePrompt
}: {
    requiredTier: string
    currentTier: string
    feature: string
    customMessage?: string
    showUpgradePrompt: boolean
}) {
    const router = useRouter()

    const tierNames = {
        free: 'Free',
        explorer: 'Explorer',
        traveler: 'Traveler',
        enterprise: 'Enterprise'
    }

    const tierColors = {
        free: 'text-gray-600',
        explorer: 'text-blue-600',
        traveler: 'text-purple-600',
        enterprise: 'text-amber-600'
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                        <Crown className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>Upgrade Required</CardTitle>
                    <CardDescription>
                        {customMessage || `You need a ${tierNames[requiredTier as keyof typeof tierNames]} subscription to access ${feature}.`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Current plan:</p>
                        <span className={`font-semibold ${tierColors[currentTier as keyof typeof tierColors]}`}>
                            {tierNames[currentTier as keyof typeof tierNames]}
                        </span>
                        <p className="text-sm text-gray-600">Required plan:</p>
                        <span className={`font-semibold ${tierColors[requiredTier as keyof typeof tierColors]}`}>
                            {tierNames[requiredTier as keyof typeof tierNames]}
                        </span>
                    </div>

                    {showUpgradePrompt && (
                        <div className="space-y-2">
                            <Button
                                onClick={() => router.push(`/pricing?upgrade=${requiredTier}`)}
                                className="w-full"
                            >
                                Upgrade to {tierNames[requiredTier as keyof typeof tierNames]}
                            </Button>
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant="outline"
                                className="w-full"
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// Convenience components for specific use cases
export function RequireAuth({ children, ...props }: Omit<RouteGuardProps, 'requireAuth'>) {
    return (
        <RouteGuard requireAuth={true} {...props}>
            {children}
        </RouteGuard>
    )
}

export function RequireSubscription({
    children,
    tier,
    ...props
}: Omit<RouteGuardProps, 'requireSubscription'> & { tier: string }) {
    return (
        <RouteGuard requireAuth={true} requireSubscription={tier} {...props}>
            {children}
        </RouteGuard>
    )
}

export function RequireAdmin({ children, ...props }: Omit<RouteGuardProps, 'requireAdmin'>) {
    return (
        <RouteGuard requireAuth={true} requireAdmin={true} {...props}>
            {children}
        </RouteGuard>
    )
}