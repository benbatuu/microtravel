import { supabase } from './supabaseClient'
import { Session, User } from '@supabase/supabase-js'

export interface SessionInfo {
    session: Session | null
    user: User | null
    isValid: boolean
    expiresAt: Date | null
}

export class SessionManager {
    private static instance: SessionManager
    private refreshTimer: NodeJS.Timeout | null = null
    private sessionCheckInterval: NodeJS.Timeout | null = null
    private readonly REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry
    private readonly SESSION_CHECK_INTERVAL = 60 * 1000 // Check every minute

    private constructor() {
        this.startSessionMonitoring()
    }

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager()
        }
        return SessionManager.instance
    }

    /**
     * Get current session information
     */
    public async getSessionInfo(): Promise<SessionInfo> {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Error getting session:', error)
                return {
                    session: null,
                    user: null,
                    isValid: false,
                    expiresAt: null
                }
            }

            if (!session) {
                return {
                    session: null,
                    user: null,
                    isValid: false,
                    expiresAt: null
                }
            }

            const expiresAt = new Date(session.expires_at! * 1000)
            const isValid = expiresAt > new Date()

            return {
                session,
                user: session.user,
                isValid,
                expiresAt
            }
        } catch (error) {
            console.error('Error in getSessionInfo:', error)
            return {
                session: null,
                user: null,
                isValid: false,
                expiresAt: null
            }
        }
    }

    /**
     * Check if session is valid and not expired
     */
    public async isSessionValid(): Promise<boolean> {
        const sessionInfo = await this.getSessionInfo()
        return sessionInfo.isValid
    }

    /**
     * Refresh the current session
     */
    public async refreshSession(): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await supabase.auth.refreshSession()

            if (error) {
                console.error('Error refreshing session:', error)
                return { success: false, error: error.message }
            }

            if (data.session) {
                this.scheduleNextRefresh(data.session)
                return { success: true }
            }

            return { success: false, error: 'No session returned from refresh' }
        } catch (error) {
            console.error('Error in refreshSession:', error)
            return { success: false, error: 'Unexpected error during session refresh' }
        }
    }

    /**
     * Schedule automatic session refresh
     */
    private scheduleNextRefresh(session: Session) {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
        }

        const expiresAt = new Date(session.expires_at! * 1000)
        const refreshAt = new Date(expiresAt.getTime() - this.REFRESH_THRESHOLD)
        const timeUntilRefresh = refreshAt.getTime() - Date.now()

        // Only schedule if refresh time is in the future
        if (timeUntilRefresh > 0) {
            this.refreshTimer = setTimeout(async () => {
                const result = await this.refreshSession()
                if (!result.success) {
                    console.error('Automatic session refresh failed:', result.error)
                    // Trigger logout if refresh fails
                    await this.handleSessionExpiry()
                }
            }, timeUntilRefresh)
        }
    }

    /**
     * Start monitoring session validity
     */
    private startSessionMonitoring() {
        // Clear existing interval
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval)
        }

        this.sessionCheckInterval = setInterval(async () => {
            const sessionInfo = await this.getSessionInfo()

            if (sessionInfo.session && sessionInfo.isValid) {
                // Schedule refresh if not already scheduled
                if (!this.refreshTimer) {
                    this.scheduleNextRefresh(sessionInfo.session)
                }
            } else if (sessionInfo.session && !sessionInfo.isValid) {
                // Session expired, handle logout
                await this.handleSessionExpiry()
            }
        }, this.SESSION_CHECK_INTERVAL)
    }

    /**
     * Handle session expiry
     */
    private async handleSessionExpiry() {
        try {
            // Clear timers
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer)
                this.refreshTimer = null
            }

            // Sign out user
            await supabase.auth.signOut()

            // Clear local storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user')
                localStorage.removeItem('rememberUser')

                // Dispatch custom event for components to listen to
                window.dispatchEvent(new CustomEvent('sessionExpired', {
                    detail: { reason: 'Session expired' }
                }))
            }
        } catch (error) {
            console.error('Error handling session expiry:', error)
        }
    }

    /**
     * Manually trigger logout
     */
    public async logout(): Promise<void> {
        try {
            // Clear timers
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer)
                this.refreshTimer = null
            }

            if (this.sessionCheckInterval) {
                clearInterval(this.sessionCheckInterval)
                this.sessionCheckInterval = null
            }

            // Sign out
            await supabase.auth.signOut()

            // Clear local storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user')
                localStorage.removeItem('rememberUser')
            }
        } catch (error) {
            console.error('Error during logout:', error)
        }
    }

    /**
     * Initialize session management for a new session
     */
    public async initializeSession(session: Session): Promise<void> {
        try {
            // Schedule automatic refresh
            this.scheduleNextRefresh(session)

            // Store session info in localStorage for persistence
            if (typeof window !== 'undefined') {
                const sessionData = {
                    userId: session.user.id,
                    email: session.user.email,
                    expiresAt: session.expires_at
                }
                localStorage.setItem('sessionInfo', JSON.stringify(sessionData))
            }
        } catch (error) {
            console.error('Error initializing session:', error)
        }
    }

    /**
     * Get time until session expires
     */
    public async getTimeUntilExpiry(): Promise<number | null> {
        const sessionInfo = await this.getSessionInfo()

        if (!sessionInfo.expiresAt) {
            return null
        }

        return sessionInfo.expiresAt.getTime() - Date.now()
    }

    /**
     * Check if session needs refresh soon
     */
    public async needsRefresh(): Promise<boolean> {
        const timeUntilExpiry = await this.getTimeUntilExpiry()

        if (timeUntilExpiry === null) {
            return false
        }

        return timeUntilExpiry <= this.REFRESH_THRESHOLD
    }

    /**
     * Clean up resources
     */
    public cleanup(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
            this.refreshTimer = null
        }

        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval)
            this.sessionCheckInterval = null
        }
    }

    /**
     * Get session storage info
     */
    public getStoredSessionInfo(): { userId: string; email: string; expiresAt: number } | null {
        if (typeof window === 'undefined') {
            return null
        }

        try {
            const stored = localStorage.getItem('sessionInfo')
            return stored ? JSON.parse(stored) : null
        } catch (error) {
            console.error('Error parsing stored session info:', error)
            return null
        }
    }

    /**
     * Clear stored session info
     */
    public clearStoredSessionInfo(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('sessionInfo')
        }
    }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()