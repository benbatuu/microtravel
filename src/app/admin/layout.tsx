'use client'

import React from 'react'
import { AdminGuard } from '@/components/auth/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

import { useAuth } from '@/hooks/useAuth'
import { Shield, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const auth = useAuth()
    const router = useRouter()

    // Show loading state while auth is loading
    if (auth.loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    // Show authentication required message
    if (!auth.isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle>Authentication Required</CardTitle>
                        <CardDescription>
                            You must be signed in to access the admin panel.
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

    // Show admin access denied message
    if (!auth.profile?.is_admin) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You don`t have permission to access the admin panel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-gray-600">
                                Signed in as: <strong>{auth.profile?.email}</strong>
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Button
                                onClick={() => router.push('/dashboard')}
                                className="w-full"
                            >
                                Back to Dashboard
                            </Button>
                            <Button
                                onClick={() => router.push('/contact?subject=admin-access')}
                                variant="outline"
                                className="w-full"
                            >
                                Request Admin Access
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Render admin layout for authorized users
    return (
        <AdminGuard>
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main content area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <AdminHeader />

                    {/* Main content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminGuard>
    )
}