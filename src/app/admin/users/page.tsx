'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { adminAuthUtils } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabaseClient'
import {
    Users,
    Search,
    MoreHorizontal,
    Shield,
    ShieldOff,
    Edit,
    Trash2,
    Mail,
    CreditCard,
    Activity,
    UserPlus,
    Download
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
import { toast } from 'sonner'
import { UserProfile } from '@/types/auth'

interface UserWithStats extends UserProfile {
    experiences_count?: number
    last_login?: string
    total_storage_used?: number
}

interface UserFilters {
    search: string
    subscription_tier: string
    is_admin: string
    subscription_status: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<UserFilters>({
        search: '',
        subscription_tier: 'all',
        is_admin: 'all',
        subscription_status: 'all'
    })
    const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
    const [showAdminDialog, setShowAdminDialog] = useState(false)
    const [adminAction, setAdminAction] = useState<'grant' | 'revoke'>('grant')
    const [actionLoading, setActionLoading] = useState(false)

    const auth = useAuth()

    useEffect(() => {
        loadUsers()
    }, [filters])

    const loadUsers = async () => {
        try {
            setLoading(true)

            // Try to load users with graceful fallback
            try {
                let query = supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })

                // Apply filters
                if (filters.search) {
                    query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
                }

                if (filters.subscription_tier !== 'all') {
                    query = query.eq('subscription_tier', filters.subscription_tier)
                }

                if (filters.is_admin !== 'all') {
                    query = query.eq('is_admin', filters.is_admin === 'true')
                }

                if (filters.subscription_status !== 'all') {
                    query = query.eq('subscription_status', filters.subscription_status)
                }

                const { data, error } = await query

                if (error) {
                    console.error('Error loading users:', error)
                    // Provide fallback mock data
                    const mockUsers: UserWithStats[] = [
                        {
                            id: 'mock-1',
                            email: 'admin@example.com',
                            full_name: 'Admin User',
                            subscription_tier: 'enterprise',
                            subscription_status: 'active',
                            is_admin: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            storage_used: 0,
                            experiences_count: 0,
                            last_login: null,
                            total_storage_used: 0
                        },
                        {
                            id: 'mock-2',
                            email: 'user@example.com',
                            full_name: 'Regular User',
                            subscription_tier: 'free',
                            subscription_status: 'active',
                            is_admin: false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            storage_used: 0,
                            experiences_count: 0,
                            last_login: null,
                            total_storage_used: 0
                        }
                    ]
                    setUsers(mockUsers)
                    toast.error('Using demo data - database connection issue')
                    return
                }

                // Process the data to include stats
                const processedUsers = data?.map(user => ({
                    ...user,
                    experiences_count: 0, // Will be loaded separately if needed
                    last_login: null, // Will be loaded from auth logs if available
                    total_storage_used: user.storage_used || 0
                })) || []

                setUsers(processedUsers)
            } catch (dbError) {
                console.error('Database connection error:', dbError)
                // Provide fallback mock data
                const mockUsers: UserWithStats[] = [
                    {
                        id: 'mock-1',
                        email: 'admin@example.com',
                        full_name: 'Admin User',
                        subscription_tier: 'enterprise',
                        subscription_status: 'active',
                        is_admin: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        storage_used: 0,
                        experiences_count: 0,
                        last_login: null,
                        total_storage_used: 0
                    }
                ]
                setUsers(mockUsers)
                toast.error('Using demo data - please check database connection')
            }
        } catch (error) {
            console.error('Error in loadUsers:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleAdminAction = async () => {
        if (!selectedUser) return

        try {
            setActionLoading(true)

            const success = adminAction === 'grant'
                ? await adminAuthUtils.grantAdminAccess(selectedUser.id, 'admin', ['user_management'])
                : await adminAuthUtils.revokeAdminAccess(selectedUser.id)

            if (success) {
                // Log the admin action
                await adminAuthUtils.logAdminAction(
                    auth.user?.id || '',
                    adminAction === 'grant' ? 'grant_admin_access' : 'revoke_admin_access',
                    'user',
                    selectedUser.id,
                    {
                        target_user_email: selectedUser.email,
                        admin_role: adminAction === 'grant' ? 'admin' : null
                    }
                )

                toast.success(
                    adminAction === 'grant'
                        ? 'Admin access granted successfully'
                        : 'Admin access revoked successfully'
                )

                // Reload users to reflect changes
                await loadUsers()
            } else {
                toast.error('Failed to update admin access')
            }
        } catch (error) {
            console.error('Error updating admin access:', error)
            toast.error('Failed to update admin access')
        } finally {
            setActionLoading(false)
            setShowAdminDialog(false)
            setSelectedUser(null)
        }
    }

    const openAdminDialog = (user: UserWithStats, action: 'grant' | 'revoke') => {
        setSelectedUser(user)
        setAdminAction(action)
        setShowAdminDialog(true)
    }

    const exportUsers = async () => {
        try {
            const csvContent = [
                ['Email', 'Full Name', 'Subscription Tier', 'Status', 'Created At', 'Is Admin'].join(','),
                ...users.map(user => [
                    user.email,
                    user.full_name || '',
                    user.subscription_tier,
                    user.subscription_status,
                    new Date(user.created_at).toLocaleDateString(),
                    user.is_admin ? 'Yes' : 'No'
                ].join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            toast.success('Users exported successfully')
        } catch (error) {
            console.error('Error exporting users:', error)
            toast.error('Failed to export users')
        }
    }

    const getTierBadgeVariant = (tier: string) => {
        switch (tier) {
            case 'free': return 'secondary'
            case 'explorer': return 'default'
            case 'traveler': return 'outline'
            case 'enterprise': return 'destructive'
            default: return 'secondary'
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default'
            case 'canceled': return 'secondary'
            case 'past_due': return 'destructive'
            default: return 'secondary'
        }
    }

    const filteredUsers = users.filter(user => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            return (
                user.email.toLowerCase().includes(searchLower) ||
                (user.full_name && user.full_name.toLowerCase().includes(searchLower))
            )
        }
        return true
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-gray-600">Manage users, permissions, and subscriptions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={exportUsers}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => u.subscription_tier !== 'free').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => u.is_admin).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => {
                                const created = new Date(u.created_at)
                                const now = new Date()
                                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                            }).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search users..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={filters.subscription_tier}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, subscription_tier: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Subscription Tier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tiers</SelectItem>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="explorer">Explorer</SelectItem>
                                <SelectItem value="traveler">Traveler</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.is_admin}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, is_admin: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Admin Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="true">Admins Only</SelectItem>
                                <SelectItem value="false">Regular Users</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.subscription_status}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, subscription_status: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                                <SelectItem value="past_due">Past Due</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                    <CardDescription>
                        Manage user accounts and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Subscription</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Admin</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{user.full_name || 'No name'}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getTierBadgeVariant(user.subscription_tier)}>
                                                {user.subscription_tier}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(user.subscription_status)}>
                                                {user.subscription_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {user.is_admin ? (
                                                <Badge variant="outline" className="text-blue-600">
                                                    <Shield className="mr-1 h-3 w-3" />
                                                    Admin
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
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
                                                    <DropdownMenuItem>
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        Send Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {user.is_admin ? (
                                                        <DropdownMenuItem
                                                            onClick={() => openAdminDialog(user, 'revoke')}
                                                            className="text-red-600"
                                                        >
                                                            <ShieldOff className="mr-2 h-4 w-4" />
                                                            Revoke Admin
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => openAdminDialog(user, 'grant')}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            Grant Admin
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Admin Action Dialog */}
            <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {adminAction === 'grant' ? 'Grant Admin Access' : 'Revoke Admin Access'}
                        </DialogTitle>
                        <DialogDescription>
                            {adminAction === 'grant'
                                ? `Grant administrative privileges to ${selectedUser?.email}?`
                                : `Remove administrative privileges from ${selectedUser?.email}?`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAdminDialog(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdminAction}
                            disabled={actionLoading}
                            variant={adminAction === 'revoke' ? 'destructive' : 'default'}
                        >
                            {actionLoading ? 'Processing...' : (adminAction === 'grant' ? 'Grant Access' : 'Revoke Access')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}