'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
    children: React.ReactNode
    requireAuth?: boolean
    requireSubscription?: boolean
    requireAdmin?: boolean
    fallback?: React.ReactNode
    redirectTo?: string
}

export function AuthGuard({
    children,
    requireAuth = true,
    requireSubscription = false,
    requireAdmin = false,
    fallback,
    redirectTo
}: AuthGuardProps) {
    const auth = useAuth()
    const router = useRouter()

    // Show loading state while auth is initializing
    if (auth.loading) {
        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading...</p>
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
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md mx-auto p-6">
                        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                        <p className="text-gray-600 mb-6">
                            You need to be signed in to access this page.
                        </p>
                        <button
                            onClick={() => router.push('/getstarted')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            )
        )
    }

    // Check subscription requirement
    if (requireSubscription && !auth.hasActiveSubscription) {
        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md mx-auto p-6">
                        <h2 className="text-2xl font-bold mb-4">Subscription Required</h2>
                        <p className="text-gray-600 mb-6">
                            You need an active subscription to access this feature.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/pricing')}
                                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View Pricing Plans
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )
        )
    }

    // Check admin requirement
    if (requireAdmin && !auth.profile?.is_admin) {
        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md mx-auto p-6">
                        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                        <p className="text-gray-600 mb-6">
                            You don&apos;t have permission to access this page.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )
        )
    }

    // All checks passed, render children
    return <>{children}</>
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