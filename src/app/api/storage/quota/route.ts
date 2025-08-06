import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getStorageQuota, getUserImages } from '@/lib/storage-management'

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies })

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const quota = await getStorageQuota(session.user.id)

        return NextResponse.json({
            success: true,
            quota
        })

    } catch (error) {
        console.error('Error getting storage quota:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies })

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { action, fileSize } = await request.json()

        if (action === 'check-upload') {
            const { canUploadFile } = await import('@/lib/storage-management')
            const result = await canUploadFile(session.user.id, fileSize)

            return NextResponse.json({
                success: true,
                canUpload: result.canUpload,
                reason: result.reason,
                quota: result.quota
            })
        }

        if (action === 'get-images') {
            const { experienceId } = await request.json()
            const images = await getUserImages(session.user.id, experienceId)

            return NextResponse.json({
                success: true,
                images
            })
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Error processing storage request:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}