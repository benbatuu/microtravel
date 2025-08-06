'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { UnauthorizedPage } from './UnauthorizedPage'

interface AuthGuardProps {
    children: React.ReactNode
    requireAuth?: boolean
    requireSubscription?: boolean | string
    requireAdmin?: boolean
    fallback?: React.ReactNode
    redirectTo?: string
    loadingFallback?: React.ReactNode
}

export function AuthGuard({
    children,
    requireAuth = true,
    requireSubscription = false,
    requireAdmin = false,
    fallback,
    redirectTo,
    loadingFallback
}: AuthGuardProps) {
    const auth = useAuth()
    const router = useRouter()

    // Show loading state while auth is initializing
    if (auth.loading) {
        return (
            loadingFallback || fallback || (
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
                <UnauthorizedPage
                    reason="authentication_required"
                    showBackButton={false}
                />
            )
        )
    }

    // Check subscription requirement
    if (requireSubscription) {
        const requiredTier = typeof requireSubscription === 'string' ? requireSubscription : 'explorer'
        const userTier = auth.profile?.subscription_tier || 'free'

        if (!hasRequiredSubscription(userTier, requiredTier)) {
            return (
                fallback || (
                    <UnauthorizedPage
                        reason="subscription_upgrade_required"
                        showBackButton={false}
                    />
                )
            )
        }
    }

    // Check admin requirement
    if (requireAdmin && !auth.profile?.is_admin) {
        return (
            fallback || (
                <UnauthorizedPage
                    reason="admin_required"
                    showBackButton={false}
                />
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

// Convenience components for specific use cases
export function RequireAuth({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
    return (
        <AuthGuard requireAuth={true} {...props}>
            {children}
        </AuthGuard>
    )
}

export function RequireSubscription({ children, ...props }: Omit<AuthGuardProps, 'requireSubscription'>) {
    return (
        <AuthGuard requireAuth={true} requireSubscription={true} {...props}>
            {children}
        </AuthGuard>
    )
}

export function RequireAdmin({ children, ...props }: Omit<AuthGuardProps, 'requireAdmin'>) {
    return (
        <AuthGuard requireAuth={true} requireAdmin={true} {...props}>
            {children}
        </AuthGuard>
    )
}

export function GuestOnly({ children }: Omit<AuthGuardProps, 'requireAuth'>) {
    const auth = useAuth()
    const router = useRouter()

    if (auth.loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (auth.isAuthenticated) {
        router.push('/dashboard')
        return null
    }

    return <>{children}</>
}