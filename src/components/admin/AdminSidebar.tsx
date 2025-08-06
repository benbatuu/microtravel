'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import {
    Shield,
    Users,
    CreditCard,
    BarChart3,
    Settings,
    HeadphonesIcon,
    Activity,
    FileText,
    ChevronLeft,
    ChevronRight,
    Home,
    AlertTriangle,
    Database,
    Webhook,
    Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItem {
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    description: string
    permission?: string
    children?: NavItem[]
}

const navigationItems: NavItem[] = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: Home,
        description: 'Admin dashboard overview'
    },
    {
        name: 'User Management',
        href: '/admin/users',
        icon: Users,
        description: 'Manage users and permissions',
        permission: 'user_management'
    },
    {
        name: 'Subscriptions',
        href: '/admin/subscriptions',
        icon: CreditCard,
        description: 'Manage subscriptions and billing',
        permission: 'subscription_management',
        children: [
            {
                name: 'Overview',
                href: '/admin/subscriptions',
                icon: BarChart3,
                description: 'Subscription overview'
            },
            {
                name: 'Billing Issues',
                href: '/admin/subscriptions/billing',
                icon: AlertTriangle,
                description: 'Handle billing issues'
            },
            {
                name: 'Analytics',
                href: '/admin/subscriptions/analytics',
                icon: BarChart3,
                description: 'Subscription analytics'
            }
        ]
    },
    {
        name: 'Support',
        href: '/admin/support',
        icon: HeadphonesIcon,
        description: 'Customer support management',
        permission: 'support_management',
        children: [
            {
                name: 'Tickets',
                href: '/admin/support/tickets',
                icon: FileText,
                description: 'Support tickets'
            },
            {
                name: 'Live Chat',
                href: '/admin/support/chat',
                icon: HeadphonesIcon,
                description: 'Live chat support'
            }
        ]
    },
    {
        name: 'System Monitoring',
        href: '/admin/monitoring',
        icon: Activity,
        description: 'System health and monitoring',
        permission: 'system_monitoring',
        children: [
            {
                name: 'Health',
                href: '/admin/monitoring/health',
                icon: Activity,
                description: 'System health'
            },
            {
                name: 'Webhooks',
                href: '/admin/monitoring/webhooks',
                icon: Webhook,
                description: 'Webhook monitoring'
            },
            {
                name: 'Alerts',
                href: '/admin/monitoring/alerts',
                icon: Bell,
                description: 'System alerts'
            },
            {
                name: 'Database',
                href: '/admin/monitoring/database',
                icon: Database,
                description: 'Database monitoring'
            }
        ]
    },
    {
        name: 'Audit Logs',
        href: '/admin/audit',
        icon: FileText,
        description: 'View admin audit logs',
        permission: 'system_monitoring'
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'Admin settings and configuration'
    }
]

export function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const pathname = usePathname()
    const auth = useAuth()

    const toggleExpanded = (href: string) => {
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        )
    }

    const hasPermission = (permission?: string) => {
        if (!permission) return true
        if (!auth.profile?.is_admin) return false
        if (auth.profile.admin_role === 'super_admin') return true

        const permissions = auth.profile.admin_permissions as string[] || []
        return permissions.includes(permission)
    }

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin'
        }
        return pathname.startsWith(href)
    }

    const renderNavItem = (item: NavItem, level: number = 0) => {
        if (!hasPermission(item.permission)) {
            return null
        }

        const active = isActive(item.href)
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedItems.includes(item.href)

        const navContent = (
            <div
                className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    active && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
                    level > 0 && 'ml-6 text-sm'
                )}
            >
                <item.icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    active && 'text-blue-600 dark:text-blue-400'
                )} />

                {!collapsed && (
                    <>
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                                {item.badge}
                            </Badge>
                        )}
                        {hasChildren && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={(e) => {
                                    e.preventDefault()
                                    toggleExpanded(item.href)
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronLeft className="h-3 w-3" />
                                ) : (
                                    <ChevronRight className="h-3 w-3" />
                                )}
                            </Button>
                        )}
                    </>
                )}
            </div>
        )

        return (
            <div key={item.href}>
                {collapsed ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={item.href}>
                                    {navContent}
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{item.name}</p>
                                <p className="text-xs text-gray-500">{item.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Link href={hasChildren ? '#' : item.href} onClick={hasChildren ? (e) => {
                        e.preventDefault()
                        toggleExpanded(item.href)
                    } : undefined}>
                        {navContent}
                    </Link>
                )}

                {/* Render children if expanded */}
                {hasChildren && isExpanded && !collapsed && (
                    <div className="mt-1 space-y-1">
                        {item.children?.map(child => renderNavItem(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={cn(
            'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <span className="font-semibold text-gray-900 dark:text-white">
                                Admin Panel
                            </span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!collapsed)}
                        className="h-8 w-8 p-0"
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map(item => renderNavItem(item))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                {!collapsed && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p>Signed in as:</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                            {auth.profile?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                                {auth.profile?.admin_role || 'Admin'}
                            </Badge>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}