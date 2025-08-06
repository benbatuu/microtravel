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
        const processed = searchParams.get('processed')
        const eventType = searchParams.get('event_type')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Get webhook events
        const events = await systemMonitoring.getWebhookEvents(
            processed === 'true' ? true : processed === 'false' ? false : undefined,
            eventType || undefined,
            limit,
            offset
        )

        // Log admin action
        await adminAuthUtils.logAdminAction(
            session.user.id,
            'view_webhook_events',
            'webhook_events',
            undefined,
            {
                filters: { processed, event_type: eventType },
                count: events.length
            }
        )

        return NextResponse.json({
            events,
            count: events.length,
            filters: {
                processed,
                event_type: eventType,
                limit,
                offset
            }
        })

    } catch (error) {
        console.error('Error in webhook events API:', error)
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
        const { action, event_id } = body

        if (action === 'retry' && event_id) {
            // Retry webhook processing
            const success = await systemMonitoring.updateWebhookEvent(
                event_id,
                false, // Not processed yet, will be updated when retry succeeds
                undefined // Clear previous error message
            )

            if (success) {
                // Log admin action
                await adminAuthUtils.logAdminAction(
                    session.user.id,
                    'retry_webhook_event',
                    'webhook_event',
                    event_id,
                    { action: 'retry' }
                )

                // TODO: Trigger actual webhook reprocessing
                // This would involve calling the webhook processing logic again

                return NextResponse.json({ success: true, message: 'Webhook retry initiated' })
            } else {
                return NextResponse.json(
                    { error: 'Failed to retry webhook event' },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Error in webhook events POST API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}