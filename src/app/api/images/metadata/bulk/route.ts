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

        // Check if user has premium subscription
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', session.user.id)
            .single()

        if (!profile || profile.subscription_tier === 'free') {
            return NextResponse.json(
                { error: 'Premium subscription required for bulk operations' },
                { status: 403 }
            )
        }

        const { imageIds, metadata } = await request.json()

        if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
            return NextResponse.json(
                { error: 'Image IDs array required' },
                { status: 400 }
            )
        }

        // Verify user owns all these images
        const { data: existingImages } = await supabase
            .from('image_metadata')
            .select('id')
            .eq('user_id', session.user.id)
            .in('id', imageIds)

        if (!existingImages || existingImages.length !== imageIds.length) {
            return NextResponse.json(
                { error: 'Some images not found or access denied' },
                { status: 404 }
            )
        }

        // Update metadata for all images
        const { data, error } = await supabase
            .from('image_metadata')
            .update({
                ...metadata,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', session.user.id)
            .in('id', imageIds)
            .select()

        if (error) {
            console.error('Error bulk updating image metadata:', error)
            return NextResponse.json(
                { error: 'Failed to update metadata' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            updated: data.length,
            data
        })

    } catch (error) {
        console.error('Error bulk updating image metadata:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}