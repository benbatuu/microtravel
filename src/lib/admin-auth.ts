import { supabase } from './supabaseClient'
import { UserProfile } from '@/types/auth'

export interface AdminSession {
    id: string
    user_id: string
    session_token: string
    ip_address?: string
    user_agent?: string
    expires_at: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface AdminAuditLog {
    id: string
    admin_user_id: string
    action: string
    resource_type?: string
    resource_id?: string
    details?: Record<string, any>
    ip_address?: string
    user_agent?: string
    created_at: string
}

export interface AdminPermissions {
    user_management: boolean
    subscription_management: boolean
    system_monitoring: boolean
    support_management: boolean
    billing_management: boolean
    content_moderation: boolean
}

export class AdminAuthError extends Error {
    constructor(message: string, public code?: string) {
        super(message)
        this.name = 'AdminAuthError'
    }
}

export const adminAuthUtils = {
    /**
     * Check if user has admin privileges
     */
    async isAdmin(userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error checking admin status:', error)
                return false
            }

            return data?.is_admin || false
        } catch (error) {
            console.error('Error in isAdmin:', error)
            return false
        }
    },

    /**
     * Get admin profile with permissions
     */
    async getAdminProfile(userId: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .eq('is_admin', true)
                .single()

            if (error) {
                console.error('Error fetching admin profile:', error)
                return null
            }

            return data
        } catch (error) {
            console.error('Error in getAdminProfile:', error)
            return null
        }
    },

    /**
     * Check if admin has specific permission
     */
    hasPermission(profile: UserProfile, permission: keyof AdminPermissions): boolean {
        if (!profile?.is_admin) return false

        // Super admin has all permissions
        if (profile.admin_role === 'super_admin') return true

        // Check specific permissions
        const permissions = profile.admin_permissions as string[] || []
        return permissions.includes(permission)
    },

    /**
     * Create admin session for enhanced security
     */
    async createAdminSession(userId: string, ipAddress?: string, userAgent?: string): Promise<AdminSession | null> {
        try {
            // Generate session token
            const sessionToken = crypto.randomUUID()
            const expiresAt = new Date()
            expiresAt.setHours(expiresAt.getHours() + 8) // 8 hour session

            const { data, error } = await supabase
                .from('admin_sessions')
                .insert({
                    user_id: userId,
                    session_token: sessionToken,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    expires_at: expiresAt.toISOString(),
                    is_active: true
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating admin session:', error)
                return null
            }

            // Update last admin login
            await supabase
                .from('profiles')
                .update({ last_admin_login: new Date().toISOString() })
                .eq('id', userId)

            return data
        } catch (error) {
            console.error('Error in createAdminSession:', error)
            return null
        }
    },

    /**
     * Validate admin session
     */
    async validateAdminSession(sessionToken: string): Promise<AdminSession | null> {
        try {
            const { data, error } = await supabase
                .from('admin_sessions')
                .select('*')
                .eq('session_token', sessionToken)
                .eq('is_active', true)
                .gt('expires_at', new Date().toISOString())
                .single()

            if (error) {
                console.error('Error validating admin session:', error)
                return null
            }

            return data
        } catch (error) {
            console.error('Error in validateAdminSession:', error)
            return null
        }
    },

    /**
     * Invalidate admin session
     */
    async invalidateAdminSession(sessionToken: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('admin_sessions')
                .update({ is_active: false })
                .eq('session_token', sessionToken)

            if (error) {
                console.error('Error invalidating admin session:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error in invalidateAdminSession:', error)
            return false
        }
    },

    /**
     * Log admin action for audit trail
     */
    async logAdminAction(
        adminUserId: string,
        action: string,
        resourceType?: string,
        resourceId?: string,
        details?: Record<string, any>,
        ipAddress?: string,
        userAgent?: string
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('admin_audit_log')
                .insert({
                    admin_user_id: adminUserId,
                    action,
                    resource_type: resourceType,
                    resource_id: resourceId,
                    details,
                    ip_address: ipAddress,
                    user_agent: userAgent
                })

            if (error) {
                console.error('Error logging admin action:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error in logAdminAction:', error)
            return false
        }
    },

    /**
     * Get admin audit logs
     */
    async getAdminAuditLogs(
        limit: number = 50,
        offset: number = 0,
        adminUserId?: string,
        action?: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<AdminAuditLog[]> {
        try {
            let query = supabase
                .from('admin_audit_log')
                .select(`
                    *,
                    admin_profile:profiles!admin_audit_log_admin_user_id_fkey(
                        full_name,
                        email
                    )
                `)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (adminUserId) {
                query = query.eq('admin_user_id', adminUserId)
            }

            if (action) {
                query = query.eq('action', action)
            }

            if (startDate) {
                query = query.gte('created_at', startDate.toISOString())
            }

            if (endDate) {
                query = query.lte('created_at', endDate.toISOString())
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching admin audit logs:', error)
                return []
            }

            return data || []
        } catch (error) {
            console.error('Error in getAdminAuditLogs:', error)
            return []
        }
    },

    /**
     * Get all admin users
     */
    async getAdminUsers(): Promise<UserProfile[]> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_admin', true)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching admin users:', error)
                return []
            }

            return data || []
        } catch (error) {
            console.error('Error in getAdminUsers:', error)
            return []
        }
    },

    /**
     * Update admin permissions
     */
    async updateAdminPermissions(
        userId: string,
        permissions: string[],
        adminRole?: string
    ): Promise<boolean> {
        try {
            const updates: any = {
                admin_permissions: permissions,
                updated_at: new Date().toISOString()
            }

            if (adminRole) {
                updates.admin_role = adminRole
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .eq('is_admin', true)

            if (error) {
                console.error('Error updating admin permissions:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error in updateAdminPermissions:', error)
            return false
        }
    },

    /**
     * Grant admin access to user
     */
    async grantAdminAccess(
        userId: string,
        adminRole: string = 'admin',
        permissions: string[] = ['user_management']
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_admin: true,
                    admin_role: adminRole,
                    admin_permissions: permissions,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (error) {
                console.error('Error granting admin access:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error in grantAdminAccess:', error)
            return false
        }
    },

    /**
     * Revoke admin access from user
     */
    async revokeAdminAccess(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_admin: false,
                    admin_role: null,
                    admin_permissions: [],
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (error) {
                console.error('Error revoking admin access:', error)
                return false
            }

            // Invalidate all admin sessions for this user
            await supabase
                .from('admin_sessions')
                .update({ is_active: false })
                .eq('user_id', userId)

            return true
        } catch (error) {
            console.error('Error in revokeAdminAccess:', error)
            return false
        }
    },

    /**
     * Clean up expired admin sessions
     */
    async cleanupExpiredSessions(): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('admin_sessions')
                .update({ is_active: false })
                .lt('expires_at', new Date().toISOString())
                .select('id')

            if (error) {
                console.error('Error cleaning up expired sessions:', error)
                return 0
            }

            return data?.length || 0
        } catch (error) {
            console.error('Error in cleanupExpiredSessions:', error)
            return 0
        }
    },

    /**
     * Get admin session statistics
     */
    async getAdminSessionStats(): Promise<{
        active_sessions: number
        total_sessions_today: number
        unique_admins_today: number
    }> {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const [activeSessions, todaySessions, uniqueAdmins] = await Promise.all([
                supabase
                    .from('admin_sessions')
                    .select('id', { count: 'exact' })
                    .eq('is_active', true)
                    .gt('expires_at', new Date().toISOString()),

                supabase
                    .from('admin_sessions')
                    .select('id', { count: 'exact' })
                    .gte('created_at', today.toISOString()),

                supabase
                    .from('admin_sessions')
                    .select('user_id')
                    .gte('created_at', today.toISOString())
            ])

            const uniqueAdminCount = new Set(uniqueAdmins.data?.map(s => s.user_id)).size

            return {
                active_sessions: activeSessions.count || 0,
                total_sessions_today: todaySessions.count || 0,
                unique_admins_today: uniqueAdminCount
            }
        } catch (error) {
            console.error('Error in getAdminSessionStats:', error)
            return {
                active_sessions: 0,
                total_sessions_today: 0,
                unique_admins_today: 0
            }
        }
    }
}