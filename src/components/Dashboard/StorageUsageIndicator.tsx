'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    HardDrive,
    AlertTriangle,
    TrendingUp,
    Zap,
    Info,
    ArrowUp
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getStorageQuota, formatBytes, getSuggestedTierForStorage } from '@/lib/storage-management'
import { subscriptionTiers } from '@/lib/stripe'

interface StorageUsageIndicatorProps {
    showUpgradePrompt?: boolean
    compact?: boolean
    className?: string
}

interface StorageData {
    used: number
    limit: number
    percentage: number
    canUpload: boolean
    tier: string
}

export function StorageUsageIndicator({
    showUpgradePrompt = true,
    compact = false,
    className = ''
}: StorageUsageIndicatorProps) {
    const { user, profile, isSubscribed } = useAuth()
    const [storageData, setStorageData] = useState<StorageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user && profile) {
            loadStorageData()
        }
    }, [user, profile])

    const loadStorageData = async () => {
        if (!user || !profile) return

        try {
            setLoading(true)
            setError(null)

            const quota = await getStorageQuota(user.id)

            setStorageData({
                used: quota.used,
                limit: quota.limit,
                percentage: quota.percentage,
                canUpload: quota.canUpload,
                tier: profile.subscription_tier
            })
        } catch (err) {
            console.error('Error loading storage data:', err)
            setError('Failed to load storage information')
        } finally {
            setLoading(false)
        }
    }

    const getStorageStatus = () => {
        if (!storageData) return { color: 'default', label: 'Unknown', icon: HardDrive }

        if (storageData.limit === -1) {
            return { color: 'secondary', label: 'Unlimited', icon: Zap }
        }

        if (storageData.percentage >= 95) {
            return { color: 'destructive', label: 'Critical', icon: AlertTriangle }
        }

        if (storageData.percentage >= 80) {
            return { color: 'warning', label: 'High', icon: TrendingUp }
        }

        return { color: 'default', label: 'Normal', icon: HardDrive }
    }

    const getSuggestedUpgrade = () => {
        if (!storageData || storageData.limit === -1) return null

        const suggestedTier = getSuggestedTierForStorage(
            storageData.tier,
            storageData.used * 2 // Suggest tier with 2x current usage
        )

        return suggestedTier ? subscriptionTiers[suggestedTier] : null
    }

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    if (!storageData) return null

    const status = getStorageStatus()
    const suggestedUpgrade = getSuggestedUpgrade()

    if (compact) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <status.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                        {formatBytes(storageData.used)} / {
                            storageData.limit === -1 ? 'Unlimited' : formatBytes(storageData.limit)
                        }
                    </div>
                    {storageData.limit !== -1 && (
                        <Progress value={storageData.percentage} className="h-1 mt-1" />
                    )}
                </div>
                <Badge variant={status.color as any}>
                    {status.label}
                </Badge>
            </div>
        )
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center space-x-2">
                        <status.icon className="h-5 w-5" />
                        <span>Storage Usage</span>
                    </div>
                    <Badge variant={status.color as any}>
                        {status.label}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Usage Display */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Used</span>
                        <span className="text-sm font-medium">
                            {formatBytes(storageData.used)} / {
                                storageData.limit === -1 ? 'Unlimited' : formatBytes(storageData.limit)
                            }
                        </span>
                    </div>
                    {storageData.limit !== -1 && (
                        <Progress
                            value={storageData.percentage}
                            className="h-2"
                        />
                    )}
                    {storageData.limit !== -1 && (
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0%</span>
                            <span>{storageData.percentage.toFixed(1)}%</span>
                            <span>100%</span>
                        </div>
                    )}
                </div>

                {/* Current Tier Info */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                        <div className="text-sm font-medium">Current Plan</div>
                        <div className="text-xs text-muted-foreground">
                            {subscriptionTiers[storageData.tier]?.name || 'Unknown'}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">
                            {storageData.limit === -1 ? 'Unlimited' : formatBytes(storageData.limit)}
                        </div>
                        <div className="text-xs text-muted-foreground">Storage</div>
                    </div>
                </div>

                {/* Warnings and Alerts */}
                {storageData.percentage >= 80 && storageData.limit !== -1 && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {storageData.percentage >= 95
                                ? 'Storage is nearly full. Upload may fail.'
                                : 'Storage is getting full. Consider upgrading your plan.'
                            }
                        </AlertDescription>
                    </Alert>
                )}

                {!storageData.canUpload && storageData.limit !== -1 && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Storage limit reached. You cannot upload more images until you free up space or upgrade your plan.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Upgrade Suggestion */}
                {showUpgradePrompt && suggestedUpgrade && storageData.percentage >= 70 && (
                    <div className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <div className="flex items-start space-x-3">
                            <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                                <ArrowUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Upgrade to {suggestedUpgrade.name}
                                </div>
                                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Get {suggestedUpgrade.limits.storage === -1
                                        ? 'unlimited'
                                        : formatBytes(suggestedUpgrade.limits.storage)
                                    } storage and more features
                                </div>
                                <Button
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                        // Navigate to upgrade page
                                        window.location.href = '/dashboard/settings?tab=subscription'
                                    }}
                                >
                                    Upgrade Now
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Storage Tips */}
                {storageData.percentage >= 50 && storageData.limit !== -1 && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="text-xs text-muted-foreground">
                                <div className="font-medium mb-1">Storage Tips:</div>
                                <ul className="space-y-1">
                                    <li>• Delete unused images to free up space</li>
                                    <li>• Images are automatically compressed on upload</li>
                                    <li>• Consider upgrading for more storage</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}