'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { adminAuthUtils } from '@/lib/admin-auth'
import {
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    Shield,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Card} from '@/components/ui/card'

interface SystemAlert {
    id: string
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    created_at: string
    resolved: boolean
}

interface AdminStats {
    active_sessions: number
    total_sessions_today: number
    unique_admins_today: number
}

const getPageTitle = (pathname: string): string => {
    const pathMap: Record<string, string> = {
        '/admin': 'Dashboard',
        '/admin/users': 'User Management',
        '/admin/subscriptions': 'Subscription Management',
        '/admin/subscriptions/billing': 'Billing Issues',
        '/admin/subscriptions/analytics': 'Subscription Analytics',
        '/admin/support': 'Support Management',
        '/admin/support/tickets': 'Support Tickets',
        '/admin/support/chat': 'Live Chat',
        '/admin/monitoring': 'System Monitoring',
        '/admin/monitoring/health': 'System Health',
        '/admin/monitoring/webhooks': 'Webhook Monitoring',
        '/admin/monitoring/alerts': 'System Alerts',
        '/admin/monitoring/database': 'Database Monitoring',
        '/admin/audit': 'Audit Logs',
        '/admin/settings': 'Admin Settings'
    }

    return pathMap[pathname] || 'Admin Panel'
}

const getBreadcrumbs = (pathname: string): Array<{ label: string; href?: string }> => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Admin', href: '/admin' }]

    if (segments.length > 1) {
        let currentPath = '/admin'
        for (let i = 1; i < segments.length; i++) {
            currentPath += `/${segments[i]}`
            const label = segments[i].charAt(0).toUpperCase() + segments[i].slice(1).replace('-', ' ')
            breadcrumbs.push({
                label,
                href: i === segments.length - 1 ? undefined : currentPath
            })
        }
    }

    return breadcrumbs
}

export function AdminHeader() {
    const [searchQuery, setSearchQuery] = useState('')
    const [alerts, setAlerts] = useState<SystemAlert[]>([])
    const [adminStats, setAdminStats] = useState<AdminStats>({
        active_sessions: 0,
        total_sessions_today: 0,
        unique_admins_today: 0
    })
    const [loading, setLoading] = useState(true)

    const pathname = usePathname()
    const router = useRouter()
    const auth = useAuth()

    const pageTitle = getPageTitle(pathname)
    const breadcrumbs = getBreadcrumbs(pathname)

    // Load admin stats and alerts
    useEffect(() => {
        const loadAdminData = async () => {
            try {
                setLoading(true)

                // Load admin session stats
                const stats = await adminAuthUtils.getAdminSessionStats()
                setAdminStats(stats)

                // TODO: Load system alerts from database
                // This would be implemented when we create the system alerts functionality
                setAlerts([])
            } catch (error) {
                console.error('Error loading admin data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadAdminData()
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // TODO: Implement admin search functionality
            console.log('Searching for:', searchQuery)
        }
    }

    const handleLogout = async () => {
        try {
            await auth.signOut()
            router.push('/')
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    const unreadAlerts = alerts.filter(alert => !alert.resolved)
    const criticalAlerts = unreadAlerts.filter(alert => alert.severity === 'critical')

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50'
            case 'high': return 'text-orange-600 bg-orange-50'
            case 'medium': return 'text-yellow-600 bg-yellow-50'
            case 'low': return 'text-blue-600 bg-blue-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return AlertTriangle
            case 'high': return AlertTriangle
            case 'medium': return Clock
            case 'low': return CheckCircle
            default: return Activity
        }
    }

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Title and breadcrumbs */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.label}>
                                {index > 0 && <span>/</span>}
                                {crumb.href ? (
                                    <button
                                        onClick={() => router.push(crumb.href!)}
                                        className="hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        {crumb.label}
                                    </button>
                                ) : (
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {crumb.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {pageTitle}
                    </h1>
                </div>

                {/* Center - Search */}
                <div className="flex-1 max-w-md mx-8">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search users, subscriptions, tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </form>
                </div>

                {/* Right side - Actions and user menu */}
                <div className="flex items-center gap-4">
                    {/* System status indicator */}
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            System Online
                        </span>
                    </div>

                    {/* Admin stats */}
                    {!loading && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                <span>{adminStats.active_sessions} active</span>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="relative">
                                <Bell className="h-5 w-5" />
                                {unreadAlerts.length > 0 && (
                                    <Badge
                                        variant={criticalAlerts.length > 0 ? "destructive" : "default"}
                                        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
                                    >
                                        {unreadAlerts.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">System Alerts</h4>
                                    {unreadAlerts.length > 0 && (
                                        <Badge variant="outline">
                                            {unreadAlerts.length} unread
                                        </Badge>
                                    )}
                                </div>

                                {unreadAlerts.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                        <p>No active alerts</p>
                                        <p className="text-xs">All systems operational</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {unreadAlerts.slice(0, 5).map((alert) => {
                                            const SeverityIcon = getSeverityIcon(alert.severity)
                                            return (
                                                <Card key={alert.id} className="p-3">
                                                    <div className="flex items-start gap-2">
                                                        <SeverityIcon className={`h-4 w-4 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">
                                                                {alert.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {alert.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(alert.created_at).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${getSeverityColor(alert.severity)}`}
                                                        >
                                                            {alert.severity}
                                                        </Badge>
                                                    </div>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                )}

                                {unreadAlerts.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => router.push('/admin/monitoring/alerts')}
                                    >
                                        View All Alerts
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* User menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium">
                                        {auth.profile?.full_name || 'Admin User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {auth.profile?.admin_role || 'Administrator'}
                                    </p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div>
                                    <p className="font-medium">{auth.profile?.full_name || 'Admin User'}</p>
                                    <p className="text-xs text-gray-500">{auth.profile?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                Admin Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                <Shield className="mr-2 h-4 w-4" />
                                User Dashboard
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}