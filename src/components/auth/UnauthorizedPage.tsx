'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Crown, Shield, AlertTriangle, ArrowLeft, Mail, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type UnauthorizedReason =
    | 'authentication_required'
    | 'subscription_upgrade_required'
    | 'admin_required'
    | 'subscription_expired'
    | 'middleware_error'

interface UnauthorizedPageProps {
    reason?: UnauthorizedReason
    title?: string
    description?: string
    showBackButton?: boolean
    showContactSupport?: boolean
    customActions?: React.ReactNode
}

const REASON_CONFIG = {
    authentication_required: {
        icon: Lock,
        title: 'Sign In Required',
        description: 'You need to be signed in to access this page.',
        color: 'blue',
        actions: ['sign_in', 'sign_up']
    },
    subscription_upgrade_required: {
        icon: Crown,
        title: 'Upgrade Required',
        description: 'This feature requires a premium subscription.',
        color: 'purple',
        actions: ['upgrade', 'view_pricing']
    },
    admin_required: {
        icon: Shield,
        title: 'Admin Access Required',
        description: 'This area is restricted to administrators.',
        color: 'red',
        actions: ['back_to_dashboard', 'contact_support']
    },
    subscription_expired: {
        icon: AlertTriangle,
        title: 'Subscription Expired',
        description: 'Your subscription has expired. Please renew to continue.',
        color: 'orange',
        actions: ['renew_subscription', 'view_pricing']
    },
    middleware_error: {
        icon: AlertTriangle,
        title: 'Access Error',
        description: 'There was an error verifying your access permissions.',
        color: 'red',
        actions: ['try_again', 'contact_support']
    }
}

export function UnauthorizedPage({
    reason = 'authentication_required',
    title,
    description,
    showBackButton = true,
    showContactSupport = true,
    customActions
}: UnauthorizedPageProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get additional context from URL params
    const message = searchParams.get('message')
    const requiredTier = searchParams.get('required')
    const currentTier = searchParams.get('current')
    const feature = searchParams.get('feature')
    const redirectTo = searchParams.get('redirectTo')

    const config = REASON_CONFIG[reason]
    const IconComponent = config.icon

    const handleAction = (action: string) => {
        switch (action) {
            case 'sign_in':
                router.push(`/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`)
                break
            case 'sign_up':
                router.push(`/auth/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`)
                break
            case 'upgrade':
                router.push(`/pricing${requiredTier ? `?upgrade=${requiredTier}` : ''}${feature ? `&feature=${encodeURIComponent(feature)}` : ''}`)
                break
            case 'view_pricing':
                router.push('/pricing')
                break
            case 'renew_subscription':
                router.push('/subscription/billing')
                break
            case 'back_to_dashboard':
                router.push('/dashboard')
                break
            case 'contact_support':
                router.push('/contact?subject=access-issue')
                break
            case 'try_again':
                window.location.reload()
                break
            default:
                break
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md space-y-6">
                {/* Back button */}
                {showBackButton && (
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                )}

                {/* Main card */}
                <Card className="border-2">
                    <CardHeader className="text-center">
                        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-${config.color}-100`}>
                            <IconComponent className={`h-8 w-8 text-${config.color}-600`} />
                        </div>
                        <CardTitle className="text-xl">
                            {title || config.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {description || message || config.description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Additional context for subscription upgrades */}
                        {reason === 'subscription_upgrade_required' && requiredTier && currentTier && (
                            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                                        <Badge variant="outline" className="capitalize">
                                            {currentTier}
                                        </Badge>
                                    </div>
                                    <div className="text-gray-400">→</div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">Required Plan</p>
                                        <Badge className="capitalize">
                                            {requiredTier}
                                        </Badge>
                                    </div>
                                </div>
                                {feature && (
                                    <p className="text-sm text-center text-gray-600">
                                        To access: <span className="font-medium">{feature}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Error details for middleware errors */}
                        {reason === 'middleware_error' && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    This might be a temporary issue. Try refreshing the page or signing in again.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Custom actions or default actions */}
                        {customActions || (
                            <div className="space-y-3">
                                {config.actions.includes('sign_in') && (
                                    <Button
                                        onClick={() => handleAction('sign_in')}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Sign In
                                    </Button>
                                )}

                                {config.actions.includes('sign_up') && (
                                    <Button
                                        onClick={() => handleAction('sign_up')}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Create Account
                                    </Button>
                                )}

                                {config.actions.includes('upgrade') && (
                                    <Button
                                        onClick={() => handleAction('upgrade')}
                                        className="w-full"
                                        size="lg"
                                    >
                                        <Crown className="h-4 w-4 mr-2" />
                                        Upgrade Now
                                    </Button>
                                )}

                                {config.actions.includes('renew_subscription') && (
                                    <Button
                                        onClick={() => handleAction('renew_subscription')}
                                        className="w-full"
                                        size="lg"
                                    >
                                        Renew Subscription
                                    </Button>
                                )}

                                {config.actions.includes('view_pricing') && (
                                    <Button
                                        onClick={() => handleAction('view_pricing')}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        View Pricing Plans
                                    </Button>
                                )}

                                {config.actions.includes('back_to_dashboard') && (
                                    <Button
                                        onClick={() => handleAction('back_to_dashboard')}
                                        className="w-full"
                                    >
                                        Back to Dashboard
                                    </Button>
                                )}

                                {config.actions.includes('try_again') && (
                                    <Button
                                        onClick={() => handleAction('try_again')}
                                        className="w-full"
                                    >
                                        Try Again
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Contact support */}
                        {showContactSupport && (
                            <>
                                <Separator />
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-gray-600">Need help?</p>
                                    <Button
                                        onClick={() => handleAction('contact_support')}
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Contact Support
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Help text */}
                <div className="text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/help')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Visit Help Center
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Convenience components for specific unauthorized scenarios
export function AuthenticationRequired(props: Omit<UnauthorizedPageProps, 'reason'>) {
    return <UnauthorizedPage reason="authentication_required" {...props} />
}

export function SubscriptionUpgradeRequired(props: Omit<UnauthorizedPageProps, 'reason'>) {
    return <UnauthorizedPage reason="subscription_upgrade_required" {...props} />
}

export function AdminRequired(props: Omit<UnauthorizedPageProps, 'reason'>) {
    return <UnauthorizedPage reason="admin_required" {...props} />
}

export function SubscriptionExpired(props: Omit<UnauthorizedPageProps, 'reason'>) {
    return <UnauthorizedPage reason="subscription_expired" {...props} />
}

export function MiddlewareError(props: Omit<UnauthorizedPageProps, 'reason'>) {
    return <UnauthorizedPage reason="middleware_error" {...props} />
}