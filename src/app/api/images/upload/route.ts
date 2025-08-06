import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { uploadImage, validateImageFile } from '@/lib/storage-management'

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

        // Parse form data
        const formData = await request.formData()
        const file = formData.get('file') as File
        const experienceId = formData.get('experienceId') as string | null
        const compress = formData.get('compress') === 'true'

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate file
        const validation = validateImageFile(file)
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: 'Invalid file',
                    details: validation.errors
                },
                { status: 400 }
            )
        }

        // Upload image
        const result = await uploadImage(
            file,
            session.user.id,
            experienceId || undefined,
            compress
        )

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            url: result.url,
            size: result.sizeBytes,
            warnings: validation.warnings
        })

    } catch (error) {
        console.error('Error uploading image:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
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

        const { searchParams } = new URL(request.url)
        const imagePath = searchParams.get('path')

        if (!imagePath) {
            return NextResponse.json(
                { error: 'Image path required' },
                { status: 400 }
            )
        }

        const { deleteImage } = await import('@/lib/storage-management')
        const success = await deleteImage(session.user.id, imagePath)

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete image' },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error deleting image:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}