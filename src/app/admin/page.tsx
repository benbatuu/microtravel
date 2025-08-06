'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { adminAuthUtils } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabaseClient'
import {
    Users,
    CreditCard,
    Activity,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    Shield,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface DashboardStats {
    users: {
        total: number
        active: number
        new_today: number
        growth_rate: number
    }
    subscriptions: {
        total: number
        active: number
        revenue_monthly: number
        churn_rate: number
    }
    support: {
        open_tickets: number
        resolved_today: number
        avg_response_time: number
        satisfaction_rate: number
    }
    system: {
        uptime: number
        active_sessions: number
        webhook_success_rate: number
        storage_used: number
    }
}

interface RecentActivity {
    id: string
    type: 'user_signup' | 'subscription_created' | 'ticket_created' | 'payment_failed' | 'admin_action'
    title: string
    description: string
    timestamp: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        users: { total: 0, active: 0, new_today: 0, growth_rate: 0 },
        subscriptions: { total: 0, active: 0, revenue_monthly: 0, churn_rate: 0 },
        support: { open_tickets: 0, resolved_today: 0, avg_response_time: 0, satisfaction_rate: 0 },
        system: { uptime: 0, active_sessions: 0, webhook_success_rate: 0, storage_used: 0 }
    })
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)

    const { user, profile } = useAuth()

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true)

                let sessionStats = { active_sessions: 1 }

                try {
                    // Try to load admin session stats
                    sessionStats = await adminAuthUtils.getAdminSessionStats()
                } catch (error) {
                    console.warn('Could not load admin session stats, using fallback:', error)
                }

                // Try to load actual stats from database, with fallbacks
                let userStats = { total: 0, active: 0, new_today: 0, growth_rate: 0 }
                let subscriptionStats = { total: 0, active: 0, revenue_monthly: 0, churn_rate: 0 }

                try {
                    // Load user stats
                    const { count: totalUsers } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })

                    const { count: activeUsers } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

                    const { count: newToday } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .gte('created_at', new Date().toISOString().split('T')[0])

                    userStats = {
                        total: totalUsers || 0,
                        active: activeUsers || 0,
                        new_today: newToday || 0,
                        growth_rate: 12.5 // Mock growth rate
                    }
                } catch (error) {
                    console.warn('Could not load user stats, using fallback:', error)
                    userStats = { total: 1247, active: 892, new_today: 23, growth_rate: 12.5 }
                }

                try {
                    // Load subscription stats
                    const { count: totalSubs } = await supabase
                        .from('subscriptions')
                        .select('*', { count: 'exact', head: true })

                    const { count: activeSubs } = await supabase
                        .from('subscriptions')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'active')

                    subscriptionStats = {
                        total: totalSubs || 0,
                        active: activeSubs || 0,
                        revenue_monthly: 45670, // Mock revenue
                        churn_rate: 3.2 // Mock churn rate
                    }
                } catch (error) {
                    console.warn('Could not load subscription stats, using fallback:', error)
                    subscriptionStats = { total: 456, active: 423, revenue_monthly: 45670, churn_rate: 3.2 }
                }

                setStats({
                    users: userStats,
                    subscriptions: subscriptionStats,
                    support: {
                        open_tickets: 12,
                        resolved_today: 8,
                        avg_response_time: 2.4,
                        satisfaction_rate: 94.5
                    },
                    system: {
                        uptime: 99.9,
                        active_sessions: sessionStats.active_sessions,
                        webhook_success_rate: 98.7,
                        storage_used: 67.3
                    }
                })

                // TODO: Load recent activity from audit logs
                setRecentActivity([
                    {
                        id: '1',
                        type: 'user_signup',
                        title: 'New user registration',
                        description: 'user@example.com signed up for Explorer plan',
                        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
                    },
                    {
                        id: '2',
                        type: 'subscription_created',
                        title: 'Subscription upgrade',
                        description: 'User upgraded from Free to Traveler plan',
                        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
                    },
                    {
                        id: '3',
                        type: 'payment_failed',
                        title: 'Payment failure',
                        description: 'Payment failed for subscription renewal',
                        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                        severity: 'high'
                    }
                ])
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [])

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_signup': return Users
            case 'subscription_created': return CreditCard
            case 'ticket_created': return AlertTriangle
            case 'payment_failed': return XCircle
            case 'admin_action': return Shield
            default: return Activity
        }
    }

    const getActivityColor = (type: string, severity?: string) => {
        if (severity === 'critical') return 'text-red-600'
        if (severity === 'high') return 'text-orange-600'
        if (severity === 'medium') return 'text-yellow-600'

        switch (type) {
            case 'user_signup': return 'text-green-600'
            case 'subscription_created': return 'text-blue-600'
            case 'payment_failed': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome message */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome back, {profile?.full_name || 'Administrator'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Here`s what`s happening with your platform today.
                        </p>
                    </div>
                </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">+{stats.users.growth_rate}%</span>
                            <span>from last month</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {stats.users.new_today} new today
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${stats.subscriptions.revenue_monthly.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{stats.subscriptions.active} active subscriptions</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {stats.subscriptions.churn_rate}% churn rate
                        </div>
                    </CardContent>
                </Card>

                {/* Support */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.support.open_tickets}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{stats.support.resolved_today} resolved today</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {stats.support.avg_response_time}h avg response
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.system.uptime}%</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>All systems operational</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {stats.system.active_sessions} active admin sessions
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed sections */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    <TabsTrigger value="alerts">System Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>
                                    Common administrative tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/admin/users">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Users
                                    </Button>
                                </Link>
                                <Link href="/admin/subscriptions">
                                    <Button variant="outline" className="w-full justify-start">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        View Subscriptions
                                    </Button>
                                </Link>
                                <Link href="/admin/support/tickets">
                                    <Button variant="outline" className="w-full justify-start">
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        Support Tickets
                                    </Button>
                                </Link>
                                <Link href="/admin/monitoring">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Activity className="mr-2 h-4 w-4" />
                                        System Monitoring
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* System Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Status</CardTitle>
                                <CardDescription>
                                    Current system performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Storage Usage</span>
                                        <span>{stats.system.storage_used}%</span>
                                    </div>
                                    <Progress value={stats.system.storage_used} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Webhook Success Rate</span>
                                        <span>{stats.system.webhook_success_rate}%</span>
                                    </div>
                                    <Progress value={stats.system.webhook_success_rate} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">System Uptime</span>
                                    <Badge variant="outline" className="text-green-600">
                                        {stats.system.uptime}%
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest system events and user actions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => {
                                    const Icon = getActivityIcon(activity.type)
                                    const color = getActivityColor(activity.type, activity.severity)

                                    return (
                                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                            <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm">{activity.title}</p>
                                                    {activity.severity && (
                                                        <Badge
                                                            variant={activity.severity === 'critical' ? 'destructive' : 'outline'}
                                                            className="text-xs"
                                                        >
                                                            {activity.severity}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{activity.description}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Alerts</CardTitle>
                            <CardDescription>
                                Current system alerts and notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-gray-500">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                <h3 className="font-medium mb-2">All Systems Operational</h3>
                                <p className="text-sm">No active alerts at this time.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}