'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { authUtils, AuthError } from '@/lib/auth'
import { sessionManager } from '@/lib/sessionManager'
import { AuthContextType, AuthState, UserProfile } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        subscription: null,
        loading: true,
        isAuthenticated: false,
        isSubscribed: false,
        hasActiveSubscription: false
    })

    /**
     * Update authentication state
     */
    const updateAuthState = useCallback(async (user: User | null) => {
        if (!user) {
            setState({
                user: null,
                profile: null,
                subscription: null,
                loading: false,
                isAuthenticated: false,
                isSubscribed: false,
                hasActiveSubscription: false
            })
            return
        }

        try {
            // Get user profile
            const profile = await authUtils.getUserProfile(user.id)

            if (!profile) {
                // If profile doesn't exist, create it
                const newProfile = await authUtils.createUserProfile(
                    user.id,
                    user.email || '',
                    user.user_metadata?.full_name
                )

                if (newProfile) {
                    const subscription = await authUtils.getSubscriptionTier(newProfile.subscription_tier)
                    setState({
                        user,
                        profile: newProfile,
                        subscription,
                        loading: false,
                        isAuthenticated: true,
                        isSubscribed: authUtils.isSubscriptionActive(newProfile),
                        hasActiveSubscription: authUtils.hasActiveSubscription(newProfile)
                    })
                } else {
                    throw new AuthError('Failed to create user profile')
                }
                return
            }

            // Get subscription tier information
            const subscription = await authUtils.getSubscriptionTier(profile.subscription_tier)

            setState({
                user,
                profile,
                subscription,
                loading: false,
                isAuthenticated: true,
                isSubscribed: authUtils.isSubscriptionActive(profile),
                hasActiveSubscription: authUtils.hasActiveSubscription(profile)
            })
        } catch (error) {
            console.error('Error updating auth state:', error)
            setState(prev => ({
                ...prev,
                loading: false
            }))
        }
    }, [])

    /**
     * Initialize authentication
     */
    useEffect(() => {
        let mounted = true

        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Error getting session:', error)
                }

                if (mounted) {
                    await updateAuthState(session?.user || null)

                    // Initialize session management if user is authenticated
                    if (session) {
                        await sessionManager.initializeSession(session)
                    }
                }

                // Listen for auth changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    async (event, session) => {
                        if (mounted) {
                            await updateAuthState(session?.user || null)

                            // Handle session management based on event
                            if (event === 'SIGNED_IN' && session) {
                                await sessionManager.initializeSession(session)
                            } else if (event === 'SIGNED_OUT') {
                                sessionManager.clearStoredSessionInfo()
                            } else if (event === 'TOKEN_REFRESHED' && session) {
                                await sessionManager.initializeSession(session)
                            }
                        }
                    }
                )

                // Listen for session expiry events
                const handleSessionExpired = () => {
                    if (mounted) {
                        updateAuthState(null)
                    }
                }

                if (typeof window !== 'undefined') {
                    window.addEventListener('sessionExpired', handleSessionExpired)
                }

                return () => {
                    subscription.unsubscribe()
                    if (typeof window !== 'undefined') {
                        window.removeEventListener('sessionExpired', handleSessionExpired)
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
                if (mounted) {
                    setState(prev => ({ ...prev, loading: false }))
                }
            }
        }

        initializeAuth()

        return () => {
            mounted = false
        }
    }, [updateAuthState])

    /**
     * Sign in with email and password
     */
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                return { error: new AuthError(error.message, error.message) }
            }

            return { error: null }
        } catch {
            return { error: new AuthError('An unexpected error occurred during sign in') }
        }
    }

    /**
     * Sign up with email and password
     */
    const signUp = async (email: string, password: string, fullName?: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName || ''
                    }
                }
            })

            if (error) {
                return { error: new AuthError(error.message, error.message) }
            }

            return { error: null }
        } catch {
            return { error: new AuthError('An unexpected error occurred during sign up') }
        }
    }

    /**
     * Sign out
     */
    const signOut = async () => {
        try {
            // Use session manager for logout
            await sessionManager.logout()
        } catch (error) {
            console.error('Error in signOut:', error)
        }
    }

    /**
     * Reset password
     */
    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            })

            if (error) {
                return { error: new AuthError(error.message, error.message) }
            }

            return { error: null }
        } catch {
            return { error: new AuthError('An unexpected error occurred during password reset') }
        }
    }

    /**
     * Update user profile
     */
    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!state.user) {
            return { error: new AuthError('User not authenticated') }
        }

        try {
            const updatedProfile = await authUtils.updateUserProfile(state.user.id, updates)

            if (!updatedProfile) {
                return { error: new AuthError('Failed to update profile') }
            }

            // Update local state
            setState(prev => ({
                ...prev,
                profile: updatedProfile,
                isSubscribed: authUtils.isSubscriptionActive(updatedProfile),
                hasActiveSubscription: authUtils.hasActiveSubscription(updatedProfile)
            }))

            return { error: null }
        } catch {
            return { error: new AuthError('An unexpected error occurred while updating profile') }
        }
    }

    /**
     * Refresh user profile from database
     */
    const refreshProfile = async () => {
        if (!state.user) return

        try {
            const profile = await authUtils.getUserProfile(state.user.id)

            if (profile) {
                const subscription = await authUtils.getSubscriptionTier(profile.subscription_tier)

                setState(prev => ({
                    ...prev,
                    profile,
                    subscription,
                    isSubscribed: authUtils.isSubscriptionActive(profile),
                    hasActiveSubscription: authUtils.hasActiveSubscription(profile)
                }))
            }
        } catch (error) {
            console.error('Error refreshing profile:', error)
        }
    }

    /**
     * Check subscription status
     */
    const checkSubscriptionStatus = async () => {
        if (!state.profile) return

        try {
            // This would typically involve checking with Stripe
            // For now, we'll just refresh the profile
            await refreshProfile()
        } catch (error) {
            console.error('Error checking subscription status:', error)
        }
    }

    const contextValue: AuthContextType = {
        ...state,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
        checkSubscriptionStatus
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}