import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

        const { searchParams } = new URL(request.url)
        const imagePath = searchParams.get('path')

        if (!imagePath) {
            return NextResponse.json(
                { error: 'Image path required' },
                { status: 400 }
            )
        }

        // Verify user owns this image
        const { data: imageMetadata } = await supabase
            .from('image_metadata')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('storage_path', imagePath)
            .single()

        if (!imageMetadata) {
            return NextResponse.json(
                { error: 'Image not found or access denied' },
                { status: 404 }
            )
        }

        // Get signed URL for download
        const { data, error } = await supabase.storage
            .from('images')
            .createSignedUrl(imagePath, 60) // 1 minute expiry

        if (error) {
            console.error('Error creating signed URL:', error)
            return NextResponse.json(
                { error: 'Failed to generate download link' },
                { status: 500 }
            )
        }

        // Redirect to signed URL
        return NextResponse.redirect(data.signedUrl)

    } catch (error) {
        console.error('Error downloading image:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}