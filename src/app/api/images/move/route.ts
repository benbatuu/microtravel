import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

        const { imageId, experienceId } = await request.json()

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

        // If experienceId is provided, verify user owns the experience
        if (experienceId && experienceId !== 'unassigned') {
            const { data: experience } = await supabase
                .from('experiences')
                .select('id')
                .eq('id', experienceId)
                .eq('user_id', session.user.id)
                .single()

            if (!experience) {
                return NextResponse.json(
                    { error: 'Experience not found or access denied' },
                    { status: 404 }
                )
            }
        }

        // Update image's experience association
        const { data, error } = await supabase
            .from('image_metadata')
            .update({
                experience_id: experienceId === 'unassigned' ? null : experienceId,
                updated_at: new Date().toISOString()
            })
            .eq('id', imageId)
            .eq('user_id', session.user.id)
            .select()
            .single()

        if (error) {
            console.error('Error moving image:', error)
            return NextResponse.json(
                { error: 'Failed to move image' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error) {
        console.error('Error moving image:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}