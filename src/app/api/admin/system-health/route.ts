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

        // Get system health check
        const healthCheck = await systemMonitoring.checkSystemHealth()

        // Get dashboard data
        const dashboardData = await systemMonitoring.getDashboardData()

        // Log admin action (only for detailed health checks, not frequent monitoring)
        const { searchParams } = new URL(request.url)
        const detailed = searchParams.get('detailed') === 'true'

        if (detailed) {
            await adminAuthUtils.logAdminAction(
                session.user.id,
                'view_system_health',
                'system_health',
                undefined,
                {
                    status: healthCheck.status,
                    issues_count: healthCheck.issues.length
                }
            )
        }

        return NextResponse.json({
            health: healthCheck,
            dashboard: dashboardData,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Error in system health API:', error)
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
        const { action, metrics } = body

        if (action === 'record_metrics' && metrics) {
            // Record system metrics
            const success = await systemMonitoring.recordMetrics({
                timestamp: new Date().toISOString(),
                cpu_usage: metrics.cpu_usage || 0,
                memory_usage: metrics.memory_usage || 0,
                disk_usage: metrics.disk_usage || 0,
                response_time: metrics.response_time || 0,
                error_rate: metrics.error_rate || 0,
                active_connections: metrics.active_connections || 0
            })

            if (success) {
                return NextResponse.json({
                    success: true,
                    message: 'Metrics recorded successfully'
                })
            } else {
                return NextResponse.json(
                    { error: 'Failed to record metrics' },
                    { status: 500 }
                )
            }
        }

        if (action === 'trigger_health_check') {
            // Trigger a comprehensive health check
            const healthCheck = await systemMonitoring.checkSystemHealth()

            // Log admin action
            await adminAuthUtils.logAdminAction(
                session.user.id,
                'trigger_health_check',
                'system_health',
                undefined,
                {
                    status: healthCheck.status,
                    issues: healthCheck.issues
                }
            )

            return NextResponse.json({
                success: true,
                health: healthCheck,
                message: 'Health check completed'
            })
        }

        if (action === 'send_test_alert') {
            // Send a test alert
            const testAlert = {
                alert_type: 'test_alert',
                severity: 'low' as const,
                title: 'Test Alert',
                message: `Test alert triggered by admin ${session.user.email}`,
                metadata: {
                    triggered_by: session.user.id,
                    test: true
                }
            }

            const success = await systemMonitoring.createAlert(testAlert)

            if (success) {
                // Log admin action
                await adminAuthUtils.logAdminAction(
                    session.user.id,
                    'send_test_alert',
                    'system_alert',
                    undefined,
                    { test: true }
                )

                return NextResponse.json({
                    success: true,
                    message: 'Test alert sent successfully'
                })
            } else {
                return NextResponse.json(
                    { error: 'Failed to send test alert' },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Error in system health POST API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}