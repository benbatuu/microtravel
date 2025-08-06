import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(request: NextRequest) {
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

        const { imageId, metadata } = await request.json()

        if (!imageId) {
            return NextResponse.json(
                { error: 'Image ID required' },
                { status: 400 }
            )
        }

        // Verify user owns this image
        const { data: existingImage } = await supabase
            .from('image_metadata')
            .select('*')
            .eq('id', imageId)
            .eq('user_id', session.user.id)
            .single()

        if (!existingImage) {
            return NextResponse.json(
                { error: 'Image not found or access denied' },
                { status: 404 }
            )
        }

        // Update metadata
        const { data, error } = await supabase
            .from('image_metadata')
            .update({
                ...metadata,
                updated_at: new Date().toISOString()
            })
            .eq('id', imageId)
            .eq('user_id', session.user.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating image metadata:', error)
            return NextResponse.json(
                { error: 'Failed to update metadata' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error) {
        console.error('Error updating image metadata:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}