/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define route protection levels
interface RouteConfig {
    path: string
    authRequired: boolean
    subscriptionRequired?: string
    adminOnly?: boolean
    redirectTo?: string
    description?: string
}

// Define subscription tier hierarchy for access control
const SUBSCRIPTION_TIERS = ['free', 'explorer', 'traveler', 'enterprise'] as const
type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number]

// Define protection levels for better organization
enum ProtectionLevel {
    PUBLIC = 'public',
    AUTH_REQUIRED = 'auth_required',
    SUBSCRIPTION_REQUIRED = 'subscription_required',
    ADMIN_ONLY = 'admin_only'
}

// Route configuration with enhanced organization
const routeConfigs: RouteConfig[] = [
    // Public routes - no authentication required
    { path: '/', authRequired: false, description: 'Landing page' },
    { path: '/getstarted', authRequired: false, description: 'Get started page' },
    { path: '/about', authRequired: false, description: 'About page' },
    { path: '/contact', authRequired: false, description: 'Contact page' },
    { path: '/privacy', authRequired: false, description: 'Privacy policy' },
    { path: '/terms', authRequired: false, description: 'Terms of service' },
    { path: '/pricing', authRequired: false, description: 'Pricing page' },
    { path: '/help', authRequired: false, description: 'Help page' },
    { path: '/faq', authRequired: false, description: 'FAQ page' },

    // Authentication routes - guest only
    { path: '/auth', authRequired: false, description: 'Authentication pages' },
    { path: '/auth/login', authRequired: false, description: 'Login page' },
    { path: '/auth/signup', authRequired: false, description: 'Signup page' },
    { path: '/auth/reset', authRequired: false, description: 'Password reset' },
    { path: '/auth/callback', authRequired: false, description: 'Auth callback' },

    // Protected dashboard routes - authentication required
    { path: '/dashboard', authRequired: true, redirectTo: '/auth/login', description: 'Main dashboard' },
    { path: '/dashboard/profile', authRequired: true, redirectTo: '/auth/login', description: 'User profile' },
    { path: '/dashboard/settings', authRequired: true, redirectTo: '/auth/login', description: 'User settings' },
    { path: '/dashboard/my-trips', authRequired: true, redirectTo: '/auth/login', description: 'User trips' },
    { path: '/dashboard/explore', authRequired: true, redirectTo: '/auth/login', description: 'Explore content' },
    { path: '/dashboard/favorites', authRequired: true, redirectTo: '/auth/login', description: 'User favorites' },
    { path: '/dashboard/notifications', authRequired: true, redirectTo: '/auth/login', description: 'Notifications' },

    // Premium features - subscription required
    { path: '/dashboard/analytics', authRequired: true, subscriptionRequired: 'explorer', redirectTo: '/dashboard?upgrade=analytics', description: 'Analytics dashboard' },
    { path: '/dashboard/export', authRequired: true, subscriptionRequired: 'explorer', redirectTo: '/dashboard?upgrade=export', description: 'Data export' },
    { path: '/dashboard/advanced', authRequired: true, subscriptionRequired: 'traveler', redirectTo: '/dashboard?upgrade=advanced', description: 'Advanced features' },
    { path: '/dashboard/bulk-operations', authRequired: true, subscriptionRequired: 'traveler', redirectTo: '/dashboard?upgrade=bulk', description: 'Bulk operations' },
    { path: '/dashboard/api-access', authRequired: true, subscriptionRequired: 'enterprise', redirectTo: '/dashboard?upgrade=api', description: 'API access' },

    // Subscription management routes
    { path: '/subscription', authRequired: true, redirectTo: '/auth/login', description: 'Subscription management' },
    { path: '/subscription/billing', authRequired: true, redirectTo: '/auth/login', description: 'Billing history' },
    { path: '/subscription/upgrade', authRequired: true, redirectTo: '/auth/login', description: 'Upgrade subscription' },
    { path: '/subscription/cancel', authRequired: true, redirectTo: '/auth/login', description: 'Cancel subscription' },

    // Admin routes - admin access only
    { path: '/admin', authRequired: true, adminOnly: true, redirectTo: '/unauthorized', description: 'Admin dashboard' },
    { path: '/admin/users', authRequired: true, adminOnly: true, redirectTo: '/unauthorized', description: 'User management' },
    { path: '/admin/subscriptions', authRequired: true, adminOnly: true, redirectTo: '/unauthorized', description: 'Subscription management' },
    { path: '/admin/analytics', authRequired: true, adminOnly: true, redirectTo: '/unauthorized', description: 'Admin analytics' },
    { path: '/admin/system', authRequired: true, adminOnly: true, redirectTo: '/unauthorized', description: 'System management' },
    { path: '/admin/support', authRequired: true, adminOnly: true, redirectTo: '/unauthorized', description: 'Support management' },
    { path: '/admin/monitoring', authRequired: true, adminOnly: true, redirectTo: '/unauthorized', description: 'System monitoring' },
    { path: '/admin/audit', authRequired: true, adminOnly: true, redirectTo: '/unauthorized', description: 'Audit logs' },

    // API routes - handled separately with their own protection
    { path: '/api', authRequired: false, description: 'API endpoints' },
]

// Helper function to check if a path matches a route config
function getRouteConfig(pathname: string): RouteConfig | null {
    // Find exact match first
    const exactMatch = routeConfigs.find(config => config.path === pathname)
    if (exactMatch) return exactMatch

    // Find prefix match for nested routes
    const prefixMatch = routeConfigs.find(config =>
        pathname.startsWith(config.path + '/') || pathname === config.path
    )
    return prefixMatch || null
}

// Helper function to check subscription tier hierarchy
function hasRequiredSubscription(userTier: string, requiredTier: string): boolean {
    const userTierIndex = SUBSCRIPTION_TIERS.indexOf(userTier as SubscriptionTier)
    const requiredTierIndex = SUBSCRIPTION_TIERS.indexOf(requiredTier as SubscriptionTier)

    // If either tier is not found, deny access
    if (userTierIndex === -1 || requiredTierIndex === -1) {
        return false
    }

    return userTierIndex >= requiredTierIndex
}

// Helper function to determine protection level
function getProtectionLevel(routeConfig: RouteConfig): ProtectionLevel {
    if (!routeConfig.authRequired) return ProtectionLevel.PUBLIC
    if (routeConfig.adminOnly) return ProtectionLevel.ADMIN_ONLY
    if (routeConfig.subscriptionRequired) return ProtectionLevel.SUBSCRIPTION_REQUIRED
    return ProtectionLevel.AUTH_REQUIRED
}

// Helper function to create redirect URL with context
function createRedirectUrl(request: NextRequest, redirectTo: string, context?: Record<string, string>): URL {
    const redirectUrl = new URL(redirectTo, request.url)

    // Add original path for post-auth redirect
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)

    // Add any additional context
    if (context) {
        Object.entries(context).forEach(([key, value]) => {
            redirectUrl.searchParams.set(key, value)
        })
    }

    return redirectUrl
}

// Helper function to log middleware actions (for debugging)
function logMiddlewareAction(action: string, pathname: string, details?: any) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] ${action}: ${pathname}`, details ? JSON.stringify(details) : '')
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const startTime = Date.now()

    // Skip middleware for static files and certain paths
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public/') ||
        pathname.startsWith('/images/') ||
        pathname.includes('.') && !pathname.includes('/api/')
    ) {
        return NextResponse.next()
    }

    logMiddlewareAction('Processing', pathname)

    // Get route configuration
    const routeConfig = getRouteConfig(pathname)

    // If no route config found, allow access but log for monitoring
    if (!routeConfig) {
        logMiddlewareAction('No config found, allowing access', pathname)
        return NextResponse.next()
    }

    const protectionLevel = getProtectionLevel(routeConfig)
    logMiddlewareAction('Protection level', pathname, { level: protectionLevel })

    // If route doesn't require authentication, allow access
    if (protectionLevel === ProtectionLevel.PUBLIC) {
        return NextResponse.next()
    }

    try {
        // Create response object
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        })

        // Create Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: any) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        // Get user session
        const { data: { session }, error } = await supabase.auth.getSession()

        // If no session and auth is required, redirect to unauthorized page
        if (!session || error) {
            logMiddlewareAction('No session, redirecting', pathname, { error: error?.message })
            const redirectUrl = createRedirectUrl(request, '/unauthorized', {
                reason: 'authentication_required'
            })
            return NextResponse.redirect(redirectUrl)
        }

        // Get user profile with subscription info
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_status, is_admin')
            .eq('id', session.user.id)
            .single()

        // Check admin access
        if (protectionLevel === ProtectionLevel.ADMIN_ONLY && !profile?.is_admin) {
            logMiddlewareAction('Admin access denied', pathname, { userId: session.user.id })
            const redirectUrl = createRedirectUrl(request, '/unauthorized', {
                reason: 'admin_required',
                message: 'Administrative access required'
            })
            return NextResponse.redirect(redirectUrl)
        }

        // Check subscription requirements
        if (protectionLevel === ProtectionLevel.SUBSCRIPTION_REQUIRED && routeConfig.subscriptionRequired) {
            const userTier = profile?.subscription_tier || 'free'
            const subscriptionStatus = profile?.subscription_status || 'active'

            logMiddlewareAction('Checking subscription', pathname, {
                userTier,
                requiredTier: routeConfig.subscriptionRequired,
                status: subscriptionStatus
            })

            // Check if subscription is active
            if (subscriptionStatus !== 'active') {
                const redirectUrl = createRedirectUrl(request, '/unauthorized', {
                    reason: 'subscription_expired',
                    message: 'Your subscription has expired'
                })
                return NextResponse.redirect(redirectUrl)
            }

            // Check if user has required subscription tier
            if (!hasRequiredSubscription(userTier, routeConfig.subscriptionRequired)) {
                const redirectUrl = createRedirectUrl(request, '/unauthorized', {
                    reason: 'subscription_upgrade_required',
                    required: routeConfig.subscriptionRequired,
                    current: userTier,
                    feature: routeConfig.description || 'this feature'
                })
                return NextResponse.redirect(redirectUrl)
            }
        }

        // Add user info to headers for use in pages
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', session.user.id)
        requestHeaders.set('x-user-email', session.user.email || '')
        requestHeaders.set('x-subscription-tier', profile?.subscription_tier || 'free')
        requestHeaders.set('x-subscription-status', profile?.subscription_status || 'active')
        requestHeaders.set('x-is-admin', profile?.is_admin ? 'true' : 'false')
        requestHeaders.set('x-protection-level', protectionLevel)
        requestHeaders.set('x-route-description', routeConfig.description || '')

        const processingTime = Date.now() - startTime
        logMiddlewareAction('Access granted', pathname, {
            processingTime: `${processingTime}ms`,
            userTier: profile?.subscription_tier || 'free'
        })

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

    } catch (error) {
        console.error('Middleware error:', error)
        logMiddlewareAction('Error occurred', pathname, { error: error instanceof Error ? error.message : 'Unknown error' })

        // On error, redirect to unauthorized page if auth was required
        if (protectionLevel !== ProtectionLevel.PUBLIC) {
            const redirectUrl = createRedirectUrl(request, '/unauthorized', {
                reason: 'middleware_error',
                message: 'An error occurred while checking access permissions'
            })
            return NextResponse.redirect(redirectUrl)
        }

        // Otherwise, allow access but log the error
        return NextResponse.next()
    }
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}