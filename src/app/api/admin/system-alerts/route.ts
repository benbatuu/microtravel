import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { systemMonitoring } from '@/lib/system-monitoring'
import { adminAuthUtils } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
    try {
        // Create Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                },
            }
        )

        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Check if user is admin
        const isAdmin = await adminAuthUtils.isAdmin(session.user.id)
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const resolved = searchParams.get('resolved')
        const severity = searchParams.get('severity')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Get system alerts
        const alerts = await systemMonitoring.getAlerts(
            resolved === 'true' ? true : resolved === 'false' ? false : undefined,
            severity || undefined,
            limit,
            offset
        )

        // Log admin action
        await adminAuthUtils.logAdminAction(
            session.user.id,
            'view_system_alerts',
            'system_alerts',
            undefined,
            {
                filters: { resolved, severity },
                count: alerts.length
            }
        )

        return NextResponse.json({
            alerts,
            count: alerts.length,
            filters: {
                resolved,
                severity,
                limit,
                offset
            }
        })

    } catch (error) {
        console.error('Error in system alerts API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Create Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                },
            }
        )

        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Check if user is admin
        const isAdmin = await adminAuthUtils.isAdmin(session.user.id)
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { action, alert_id, alert_data } = body

        if (action === 'create' && alert_data) {
            // Create new system alert
            const success = await systemMonitoring.createAlert({
                alert_type: alert_data.alert_type,
                severity: alert_data.severity,
                title: alert_data.title,
                message: alert_data.message,
                metadata: alert_data.metadata || {}
            })

            if (success) {
                // Log admin action
                await adminAuthUtils.logAdminAction(
                    session.user.id,
                    'create_system_alert',
                    'system_alert',
                    undefined,
                    {
                        alert_type: alert_data.alert_type,
                        severity: alert_data.severity,
                        title: alert_data.title
                    }
                )

                return NextResponse.json({ success: true, message: 'Alert created successfully' })
            } else {
                return NextResponse.json(
                    { error: 'Failed to create alert' },
                    { status: 500 }
                )
            }
        }

        if (action === 'resolve' && alert_id) {
            // Resolve system alert
            const success = await systemMonitoring.resolveAlert(alert_id, session.user.id)

            if (success) {
                // Log admin action
                await adminAuthUtils.logAdminAction(
                    session.user.id,
                    'resolve_system_alert',
                    'system_alert',
                    alert_id,
                    { action: 'resolve' }
                )

                return NextResponse.json({ success: true, message: 'Alert resolved successfully' })
            } else {
                return NextResponse.json(
                    { error: 'Failed to resolve alert' },
                    { status: 500 }
                )
            }
        }

        if (action === 'auto_resolve_stale') {
            // Auto-resolve stale alerts
            const maxAgeHours = body.max_age_hours || 24
            const resolvedCount = await systemMonitoring.autoResolveStaleAlerts(maxAgeHours)

            // Log admin action
            await adminAuthUtils.logAdminAction(
                session.user.id,
                'auto_resolve_stale_alerts',
                'system_alerts',
                undefined,
                {
                    max_age_hours: maxAgeHours,
                    resolved_count: resolvedCount
                }
            )

            return NextResponse.json({
                success: true,
                message: `Auto-resolved ${resolvedCount} stale alerts`,
                resolved_count: resolvedCount
            })
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Error in system alerts POST API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Create Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                },
            }
        )

        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Check if user is admin
        const isAdmin = await adminAuthUtils.isAdmin(session.user.id)
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { alert_id } = body

        if (!alert_id) {
            return NextResponse.json(
                { error: 'Alert ID is required' },
                { status: 400 }
            )
        }

        // Resolve the alert
        const success = await systemMonitoring.resolveAlert(alert_id, session.user.id)

        if (success) {
            // Log admin action
            await adminAuthUtils.logAdminAction(
                session.user.id,
                'resolve_system_alert',
                'system_alert',
                alert_id,
                { method: 'PUT' }
            )

            return NextResponse.json({ success: true, message: 'Alert resolved successfully' })
        } else {
            return NextResponse.json(
                { error: 'Failed to resolve alert' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Error in system alerts PUT API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}