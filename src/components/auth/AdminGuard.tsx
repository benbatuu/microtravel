'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Shield, AlertTriangle, Lock, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface AdminGuardProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    requireSuperAdmin?: boolean
    customMessage?: string
    showContactSupport?: boolean
}

export function AdminGuard({
    children,
    fallback,
    requireSuperAdmin = false,
    customMessage,
    showContactSupport = true
}: AdminGuardProps) {
    const auth = useAuth()
    const router = useRouter()

    // Check if user is authenticated
    if (!auth.isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Lock className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle>Authentication Required</CardTitle>
                        <CardDescription>
                            You must be signed in to access administrative features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push('/auth/login?redirectTo=/admin')}
                            className="w-full"
                        >
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Check if user has admin privileges
    const isAdmin = auth.profile?.is_admin
    const isSuperAdmin = auth.profile?.role === 'super_admin' // Assuming we might have different admin levels

    if (!isAdmin || (requireSuperAdmin && !isSuperAdmin)) {
        if (fallback) {
            return <>{fallback}</>
        }

        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            {customMessage ||
                                (requireSuperAdmin
                                    ? 'This area requires super administrator privileges.'
                                    : 'This area is restricted to administrators only.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* User info */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Signed in as:</span>
                                <Badge variant="outline">{auth.profile?.email}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Access level:</span>
                                <Badge variant={isAdmin ? "default" : "secondary"}>
                                    {isAdmin ? 'Admin' : 'User'}
                                </Badge>
                            </div>
                        </div>

                        {/* Warning message */}
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                If you believe you should have access to this area, please contact your system administrator.
                            </AlertDescription>
                        </Alert>

                        {/* Action buttons */}
                        <div className="space-y-2">
                            <Button
                                onClick={() => router.push('/dashboard')}
                                className="w-full"
                            >
                                Back to Dashboard
                            </Button>
                            {showContactSupport && (
                                <Button
                                    onClick={() => router.push('/contact?subject=admin-access')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Contact Support
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // User has admin access, render children
    return <>{children}</>
}

// Admin section wrapper component
export function AdminSection({
    children,
    title,
    description,
    requireSuperAdmin = false,
    className = ""
}: {
    children: React.ReactNode
    title?: string
    description?: string
    requireSuperAdmin?: boolean
    className?: string
}) {
    return (
        <AdminGuard requireSuperAdmin={requireSuperAdmin}>
            <div className={`space-y-6 ${className}`}>
                {(title || description) && (
                    <div className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="h-5 w-5 text-gray-600" />
                            {title && <h2 className="text-2xl font-bold">{title}</h2>}
                            <Badge variant="outline" className="ml-auto">
                                Admin Only
                            </Badge>
                        </div>
                        {description && (
                            <p className="text-gray-600">{description}</p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </AdminGuard>
    )
}

// Admin feature gate for inline admin features
export function AdminFeatureGate({
    children,
    feature,
    fallback,
    requireSuperAdmin = false,
    showUpgradeMessage = true
}: {
    children: React.ReactNode
    feature: string
    fallback?: React.ReactNode
    requireSuperAdmin?: boolean
    showUpgradeMessage?: boolean
}) {
    const auth = useAuth()
    const router = useRouter()

    const isAdmin = auth.profile?.is_admin
    const isSuperAdmin = auth.profile?.role === 'super_admin'

    const hasAccess = isAdmin && (!requireSuperAdmin || isSuperAdmin)

    if (hasAccess) {
        return <>{children}</>
    }

    if (fallback) {
        return <>{fallback}</>
    }

    if (!showUpgradeMessage) {
        return null
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <Shield className="h-4 w-4 text-red-500" />
            <div className="flex-1">
                <p className="text-sm font-medium text-red-700">{feature}</p>
                <p className="text-xs text-red-600">
                    {requireSuperAdmin ? 'Requires super admin privileges' : 'Requires admin privileges'}
                </p>
            </div>
            <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/contact?subject=admin-access')}
                className="border-red-300 text-red-700 hover:bg-red-100"
            >
                Request Access
            </Button>
        </div>
    )
}

// Hook for checking admin status
export function useAdminStatus() {
    const auth = useAuth()

    return {
        isAdmin: auth.profile?.is_admin || false,
        isSuperAdmin: auth.profile?.role === 'super_admin' || false,
        canAccessAdmin: auth.isAuthenticated && auth.profile?.is_admin,
        canAccessSuperAdmin: auth.isAuthenticated && auth.profile?.role === 'super_admin'
    }
}