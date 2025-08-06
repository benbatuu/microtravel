'use client'

import React, { useEffect } from 'react'
import { useAuth as useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

/**
 * Main authentication hook - re-export from context
 */
export const useAuth = useAuthContext

/**
 * Hook for pages that require authentication
 */
export function useRequireAuth() {
    const auth = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (!auth.loading && !auth.isAuthenticated) {
            router.push('/getstarted')
        }
    }, [auth.loading, auth.isAuthenticated, router])

    return auth
}

/**
 * Hook for pages that require subscription
 */
export function useRequireSubscription() {
    const auth = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (!auth.loading) {
            if (!auth.isAuthenticated) {
                router.push('/getstarted')
            } else if (!auth.hasActiveSubscription) {
                router.push('/pricing')
            }
        }
    }, [auth.loading, auth.isAuthenticated, auth.hasActiveSubscription, router])

    return auth
}

/**
 * Hook for admin-only pages
 */
export function useRequireAdmin() {
    const auth = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (!auth.loading) {
            if (!auth.isAuthenticated) {
                router.push('/getstarted')
            } else if (!auth.profile?.is_admin) {
                router.push('/dashboard')
            }
        }
    }, [auth.loading, auth.isAuthenticated, auth.profile?.is_admin, router])

    return auth
}

/**
 * Hook for guest-only pages (login, signup)
 */
export function useGuestOnly() {
    const auth = useAuthContext()
    const router = useRouter()

    useEffect(() => {
        if (!auth.loading && auth.isAuthenticated) {
            router.push('/dashboard')
        }
    }, [auth.loading, auth.isAuthenticated, router])

    return auth
}

/**
 * Hook to check subscription limits
 */
export function useSubscriptionLimits() {
    const auth = useAuthContext()

    const canCreateExperience = (currentCount: number) => {
        if (!auth.profile) return false

        const limits = {
            free: 5,
            explorer: 50,
            traveler: -1, // unlimited
            enterprise: -1
        }

        const limit = limits[auth.profile.subscription_tier as keyof typeof limits] || 0
        return limit === -1 || currentCount < limit
    }

    const canUploadImage = async (imageSize: number) => {
        if (!auth.profile || !auth.user) return false

        try {
            const { canUploadFile } = await import('@/lib/storage-management')
            const result = await canUploadFile(auth.user.id, imageSize)
            return result.canUpload
        } catch (error) {
            console.error('Error checking upload permission:', error)
            return false
        }
    }

    const canExportData = (currentExports: number) => {
        if (!auth.profile) return false

        const limits = {
            free: 1,
            explorer: 10,
            traveler: -1, // unlimited
            enterprise: -1
        }

        const limit = limits[auth.profile.subscription_tier as keyof typeof limits] || 0
        return limit === -1 || currentExports < limit
    }

    const getStorageUsagePercentage = async () => {
        if (!auth.profile || !auth.user) return 0

        try {
            const { getStorageQuota } = await import('@/lib/storage-management')
            const quota = await getStorageQuota(auth.user.id)
            return quota.percentage
        } catch (error) {
            console.error('Error getting storage usage:', error)
            return 0
        }
    }

    const getStorageQuota = async () => {
        if (!auth.profile || !auth.user) return null

        try {
            const { getStorageQuota: getQuota } = await import('@/lib/storage-management')
            return await getQuota(auth.user.id)
        } catch (error) {
            console.error('Error getting storage quota:', error)
            return null
        }
    }

    return {
        canCreateExperience,
        canUploadImage,
        canExportData,
        getStorageUsagePercentage,
        getStorageQuota,
        tier: auth.profile?.subscription_tier || 'free',
        isSubscribed: auth.hasActiveSubscription
    }
}
/*
*
 * Hook for session management utilities
 */
export function useSessionManager() {
    const [sessionInfo, setSessionInfo] = React.useState<{
        isValid: boolean
        expiresAt: Date | null
        timeUntilExpiry: number | null
        needsRefresh: boolean
    }>({
        isValid: false,
        expiresAt: null,
        timeUntilExpiry: null,
        needsRefresh: false
    })

    const updateSessionInfo = React.useCallback(async () => {
        const { sessionManager } = await import('@/lib/sessionManager')

        const info = await sessionManager.getSessionInfo()
        const timeUntilExpiry = await sessionManager.getTimeUntilExpiry()
        const needsRefresh = await sessionManager.needsRefresh()

        setSessionInfo({
            isValid: info.isValid,
            expiresAt: info.expiresAt,
            timeUntilExpiry,
            needsRefresh
        })
    }, [])

    React.useEffect(() => {
        updateSessionInfo()

        // Update session info every minute
        const interval = setInterval(updateSessionInfo, 60000)

        return () => clearInterval(interval)
    }, [updateSessionInfo])

    const refreshSession = React.useCallback(async () => {
        const { sessionManager } = await import('@/lib/sessionManager')
        const result = await sessionManager.refreshSession()

        if (result.success) {
            await updateSessionInfo()
        }

        return result
    }, [updateSessionInfo])

    const getStoredSessionInfo = React.useCallback(async () => {
        const { sessionManager } = await import('@/lib/sessionManager')
        return sessionManager.getStoredSessionInfo()
    }, [])

    return {
        ...sessionInfo,
        refreshSession,
        getStoredSessionInfo,
        updateSessionInfo
    }
}