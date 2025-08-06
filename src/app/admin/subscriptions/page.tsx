'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { adminAuthUtils } from '@/lib/admin-auth'
import {
    CreditCard,
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    MoreHorizontal,
    Search,
    Download,
    RefreshCw,
    Mail,
    Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface SubscriptionData {
    id: string
    user_id: string
    stripe_subscription_id: string
    stripe_customer_id: string
    tier: string
    status: string
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
    created_at: string
    updated_at: string
    user: {
        email: string
        full_name: string | null
    }
}

interface SubscriptionStats {
    total_subscriptions: number
    active_subscriptions: number
    monthly_revenue: number
    churn_rate: number
    tier_distribution: Record<string, number>
    recent_cancellations: number
}

interface BillingIssue {
    id: string
    user_id: string
    subscription_id: string
    issue_type: 'payment_failed' | 'card_expired' | 'insufficient_funds' | 'dispute'
    description: string
    status: 'open' | 'resolved' | 'escalated'
    created_at: string
    user: {
        email: string
        full_name: string | null
    }
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
    const [billingIssues, setBillingIssues] = useState<BillingIssue[]>([])
    const [stats, setStats] = useState<SubscriptionStats>({
        total_subscriptions: 0,
        active_subscriptions: 0,
        monthly_revenue: 0,
        churn_rate: 0,
        tier_distribution: {},
        recent_cancellations: 0
    })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [tierFilter, setTierFilter] = useState('all')
    const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionData | null>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const auth = useAuth()

    useEffect(() => {
        loadSubscriptionData()
    }, [])

    const loadSubscriptionData = async () => {
        try {
            setLoading(true)

            // Load subscriptions with user data
            const { data: subscriptionsData, error: subscriptionsError } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    user:profiles!subscriptions_user_id_fkey(
                        email,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false })

            if (subscriptionsError) {
                console.error('Error loading subscriptions:', subscriptionsError)
                toast.error('Failed to load subscriptions')
                return
            }

            setSubscriptions(subscriptionsData || [])

            // Calculate stats
            const totalSubs = subscriptionsData?.length || 0
            const activeSubs = subscriptionsData?.filter(s => s.status === 'active').length || 0
            const tierDist = subscriptionsData?.reduce((acc, sub) => {
                acc[sub.tier] = (acc[sub.tier] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {}

            // Calculate recent cancellations (last 30 days)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            const recentCancellations = subscriptionsData?.filter(s =>
                s.status === 'canceled' && new Date(s.updated_at) > thirtyDaysAgo
            ).length || 0

            setStats({
                total_subscriptions: totalSubs,
                active_subscriptions: activeSubs,
                monthly_revenue: 45670, // TODO: Calculate from actual payment data
                churn_rate: totalSubs > 0 ? (recentCancellations / totalSubs) * 100 : 0,
                tier_distribution: tierDist,
                recent_cancellations: recentCancellations
            })

            // Load billing issues (mock data for now)
            setBillingIssues([
                {
                    id: '1',
                    user_id: 'user1',
                    subscription_id: 'sub1',
                    issue_type: 'payment_failed',
                    description: 'Credit card payment failed - insufficient funds',
                    status: 'open',
                    created_at: new Date().toISOString(),
                    user: {
                        email: 'user@example.com',
                        full_name: 'John Doe'
                    }
                }
            ])

        } catch (error) {
            console.error('Error loading subscription data:', error)
            toast.error('Failed to load subscription data')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelSubscription = async (subscription: SubscriptionData) => {
        try {
            setActionLoading(true)

            // TODO: Implement Stripe subscription cancellation
            // This would involve calling Stripe API to cancel the subscription

            // For now, just update the local status
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    status: 'canceled',
                    cancel_at_period_end: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', subscription.id)

            if (error) {
                console.error('Error canceling subscription:', error)
                toast.error('Failed to cancel subscription')
                return
            }

            // Log admin action
            await adminAuthUtils.logAdminAction(
                auth.user?.id || '',
                'cancel_subscription',
                'subscription',
                subscription.id,
                {
                    user_email: subscription.user.email,
                    tier: subscription.tier,
                    reason: 'admin_cancellation'
                }
            )

            toast.success('Subscription canceled successfully')
            await loadSubscriptionData()
        } catch (error) {
            console.error('Error in handleCancelSubscription:', error)
            toast.error('Failed to cancel subscription')
        } finally {
            setActionLoading(false)
            setShowDetailsDialog(false)
        }
    }

    const handleRefundSubscription = async (subscription: SubscriptionData) => {
        try {
            setActionLoading(true)

            // TODO: Implement Stripe refund logic
            // This would involve calling Stripe API to process a refund

            // Log admin action
            await adminAuthUtils.logAdminAction(
                auth.user?.id || '',
                'refund_subscription',
                'subscription',
                subscription.id,
                {
                    user_email: subscription.user.email,
                    tier: subscription.tier,
                    amount: 'full_refund'
                }
            )

            toast.success('Refund processed successfully')
        } catch (error) {
            console.error('Error processing refund:', error)
            toast.error('Failed to process refund')
        } finally {
            setActionLoading(false)
        }
    }

    const exportSubscriptions = async () => {
        try {
            const csvContent = [
                ['Email', 'Name', 'Tier', 'Status', 'Start Date', 'End Date', 'Revenue'].join(','),
                ...subscriptions.map(sub => [
                    sub.user.email,
                    sub.user.full_name || '',
                    sub.tier,
                    sub.status,
                    new Date(sub.current_period_start).toLocaleDateString(),
                    new Date(sub.current_period_end).toLocaleDateString(),
                    '$0' // TODO: Calculate actual revenue
                ].join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            toast.success('Subscriptions exported successfully')
        } catch (error) {
            console.error('Error exporting subscriptions:', error)
            toast.error('Failed to export subscriptions')
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default'
            case 'canceled': return 'secondary'
            case 'past_due': return 'destructive'
            case 'unpaid': return 'destructive'
            case 'incomplete': return 'outline'
            default: return 'secondary'
        }
    }

    const getTierBadgeVariant = (tier: string) => {
        switch (tier) {
            case 'explorer': return 'default'
            case 'traveler': return 'outline'
            case 'enterprise': return 'destructive'
            default: return 'secondary'
        }
    }

    const getIssueIcon = (type: string) => {
        switch (type) {
            case 'payment_failed': return AlertTriangle
            case 'card_expired': return Clock
            case 'insufficient_funds': return DollarSign
            case 'dispute': return AlertTriangle
            default: return AlertTriangle
        }
    }

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = searchQuery === '' ||
            sub.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.user.full_name && sub.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
        const matchesTier = tierFilter === 'all' || sub.tier === tierFilter

        return matchesSearch && matchesStatus && matchesTier
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Subscription Management</h1>
                    <p className="text-gray-600">Monitor and manage user subscriptions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => loadSubscriptionData()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={exportSubscriptions}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_subscriptions}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.active_subscriptions} active
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.monthly_revenue.toLocaleString()}</div>
                        <div className="flex items-center text-xs text-green-600">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            +12.5% from last month
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.churn_rate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.recent_cancellations} cancellations this month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Billing Issues</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{billingIssues.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Require attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="subscriptions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    <TabsTrigger value="billing-issues">Billing Issues</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="subscriptions" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search subscriptions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="canceled">Canceled</SelectItem>
                                        <SelectItem value="past_due">Past Due</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={tierFilter} onValueChange={setTierFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tiers</SelectItem>
                                        <SelectItem value="explorer">Explorer</SelectItem>
                                        <SelectItem value="traveler">Traveler</SelectItem>
                                        <SelectItem value="enterprise">Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscriptions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
                            <CardDescription>
                                Manage active and inactive subscriptions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Tier</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Current Period</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubscriptions.map((subscription) => (
                                        <TableRow key={subscription.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {subscription.user.full_name || 'No name'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {subscription.user.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getTierBadgeVariant(subscription.tier)}>
                                                    {subscription.tier}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(subscription.status)}>
                                                    {subscription.status}
                                                </Badge>
                                                {subscription.cancel_at_period_end && (
                                                    <div className="text-xs text-orange-600 mt-1">
                                                        Cancels at period end
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {new Date(subscription.current_period_start).toLocaleDateString()} -
                                                </div>
                                                <div className="text-sm">
                                                    {new Date(subscription.current_period_end).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(subscription.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedSubscription(subscription)
                                                                setShowDetailsDialog(true)
                                                            }}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Contact Customer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {subscription.status === 'active' && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleCancelSubscription(subscription)}
                                                                className="text-red-600"
                                                            >
                                                                <AlertTriangle className="mr-2 h-4 w-4" />
                                                                Cancel Subscription
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => handleRefundSubscription(subscription)}
                                                            className="text-red-600"
                                                        >
                                                            <DollarSign className="mr-2 h-4 w-4" />
                                                            Process Refund
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="billing-issues" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Issues</CardTitle>
                            <CardDescription>
                                Resolve payment and billing problems
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {billingIssues.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                    <h3 className="font-medium mb-2">No Billing Issues</h3>
                                    <p className="text-sm">All payments are processing normally.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {billingIssues.map((issue) => {
                                        const Icon = getIssueIcon(issue.issue_type)
                                        return (
                                            <div key={issue.id} className="flex items-start gap-3 p-4 border rounded-lg">
                                                <Icon className="h-5 w-5 text-red-500 mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{issue.user.full_name || issue.user.email}</h4>
                                                        <Badge variant="destructive" className="text-xs">
                                                            {issue.issue_type.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(issue.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline">
                                                        Contact
                                                    </Button>
                                                    <Button size="sm">
                                                        Resolve
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tier Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(stats.tier_distribution).map(([tier, count]) => (
                                        <div key={tier} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getTierBadgeVariant(tier)}>
                                                    {tier}
                                                </Badge>
                                            </div>
                                            <div className="text-sm font-medium">{count} users</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Monthly Recurring Revenue</span>
                                        <span className="font-medium">${stats.monthly_revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Average Revenue Per User</span>
                                        <span className="font-medium">
                                            ${stats.active_subscriptions > 0 ?
                                                Math.round(stats.monthly_revenue / stats.active_subscriptions) : 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Churn Rate</span>
                                        <span className="font-medium">{stats.churn_rate.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Subscription Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Subscription Details</DialogTitle>
                        <DialogDescription>
                            Detailed information for {selectedSubscription?.user.email}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSubscription && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Customer</label>
                                    <p className="font-medium">{selectedSubscription.user.full_name || 'No name'}</p>
                                    <p className="text-sm text-gray-600">{selectedSubscription.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Subscription Tier</label>
                                    <div className="mt-1">
                                        <Badge variant={getTierBadgeVariant(selectedSubscription.tier)}>
                                            {selectedSubscription.tier}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">
                                        <Badge variant={getStatusBadgeVariant(selectedSubscription.status)}>
                                            {selectedSubscription.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Stripe Customer ID</label>
                                    <p className="text-sm font-mono">{selectedSubscription.stripe_customer_id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Current Period</label>
                                    <p className="text-sm">
                                        {new Date(selectedSubscription.current_period_start).toLocaleDateString()} - {' '}
                                        {new Date(selectedSubscription.current_period_end).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created</label>
                                    <p className="text-sm">{new Date(selectedSubscription.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            {selectedSubscription.cancel_at_period_end && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p className="text-sm text-orange-800">
                                        This subscription is set to cancel at the end of the current billing period.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}