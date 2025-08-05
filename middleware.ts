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
}

// Route configuration
const routeConfigs: RouteConfig[] = [
    // Public routes
    { path: '/', authRequired: false },
    { path: '/getstarted', authRequired: false },
    { path: '/about', authRequired: false },
    { path: '/contact', authRequired: false },
    { path: '/privacy', authRequired: false },
    { path: '/terms', authRequired: false },
    { path: '/pricing', authRequired: false },

    // Auth routes
    { path: '/auth', authRequired: false },

    // Protected dashboard routes
    { path: '/dashboard', authRequired: true, redirectTo: '/auth' },
    { path: '/dashboard/profile', authRequired: true, redirectTo: '/auth' },
    { path: '/dashboard/settings', authRequired: true, redirectTo: '/auth' },
    { path: '/dashboard/my-trips', authRequired: true, redirectTo: '/auth' },
    { path: '/dashboard/explore', authRequired: true, redirectTo: '/auth' },
    { path: '/dashboard/favorites', authRequired: true, redirectTo: '/auth' },

    // Premium features (require paid subscription)
    { path: '/dashboard/analytics', authRequired: true, subscriptionRequired: 'explorer', redirectTo: '/dashboard?upgrade=true' },
    { path: '/dashboard/export', authRequired: true, subscriptionRequired: 'explorer', redirectTo: '/dashboard?upgrade=true' },
    { path: '/dashboard/advanced', authRequired: true, subscriptionRequired: 'traveler', redirectTo: '/dashboard?upgrade=true' },

    // Admin routes
    { path: '/admin', authRequired: true, adminOnly: true, redirectTo: '/dashboard' },

    // API routes (will be handled separately)
    { path: '/api', authRequired: false },
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
    const tierHierarchy = ['free', 'explorer', 'traveler', 'enterprise']
    const userTierIndex = tierHierarchy.indexOf(userTier)
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier)

    return userTierIndex >= requiredTierIndex
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for static files and API routes that don't need protection
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Get route configuration
    const routeConfig = getRouteConfig(pathname)

    // If no route config found, allow access (default behavior)
    if (!routeConfig) {
        return NextResponse.next()
    }

    // If route doesn't require authentication, allow access
    if (!routeConfig.authRequired) {
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

        // If no session and auth is required, redirect to login
        if (!session || error) {
            const redirectUrl = new URL(routeConfig.redirectTo || '/auth', request.url)
            redirectUrl.searchParams.set('redirectTo', pathname)
            return NextResponse.redirect(redirectUrl)
        }

        // Get user profile with subscription info
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_status, is_admin')
            .eq('id', session.user.id)
            .single()

        // Check admin access
        if (routeConfig.adminOnly && !profile?.is_admin) {
            const redirectUrl = new URL(routeConfig.redirectTo || '/dashboard', request.url)
            return NextResponse.redirect(redirectUrl)
        }

        // Check subscription requirements
        if (routeConfig.subscriptionRequired) {
            const userTier = profile?.subscription_tier || 'free'
            const subscriptionStatus = profile?.subscription_status || 'active'

            // Check if subscription is active
            if (subscriptionStatus !== 'active') {
                const redirectUrl = new URL('/dashboard?subscription=expired', request.url)
                return NextResponse.redirect(redirectUrl)
            }

            // Check if user has required subscription tier
            if (!hasRequiredSubscription(userTier, routeConfig.subscriptionRequired)) {
                const redirectUrl = new URL(routeConfig.redirectTo || '/dashboard?upgrade=true', request.url)
                redirectUrl.searchParams.set('required', routeConfig.subscriptionRequired)
                return NextResponse.redirect(redirectUrl)
            }
        }

        // Add user info to headers for use in pages
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', session.user.id)
        requestHeaders.set('x-user-email', session.user.email || '')
        requestHeaders.set('x-subscription-tier', profile?.subscription_tier || 'free')
        requestHeaders.set('x-subscription-status', profile?.subscription_status || 'active')

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

    } catch (error) {
        console.error('Middleware error:', error)

        // On error, redirect to login if auth was required
        if (routeConfig.authRequired) {
            const redirectUrl = new URL('/auth', request.url)
            redirectUrl.searchParams.set('redirectTo', pathname)
            redirectUrl.searchParams.set('error', 'middleware_error')
            return NextResponse.redirect(redirectUrl)
        }

        // Otherwise, allow access
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