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

        // Check if user has premium subscription
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', session.user.id)
            .single()

        if (!profile || profile.subscription_tier === 'free') {
            return NextResponse.json(
                { error: 'Premium subscription required for archiving' },
                { status: 403 }
            )
        }

        const { imageId } = await request.json()

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

        // Move image to archive folder in storage
        const archivePath = existingImage.storage_path.replace(
            `${session.user.id}/`,
            `${session.user.id}/archive/`
        )

        // Copy to archive location
        const { error: copyError } = await supabase.storage
            .from('images')
            .copy(existingImage.storage_path, archivePath)

        if (copyError) {
            console.error('Error copying to archive:', copyError)
            return NextResponse.json(
                { error: 'Failed to archive image' },
                { status: 500 }
            )
        }

        // Delete original
        const { error: deleteError } = await supabase.storage
            .from('images')
            .remove([existingImage.storage_path])

        if (deleteError) {
            console.error('Error deleting original:', deleteError)
            // Try to clean up the archive copy
            await supabase.storage.from('images').remove([archivePath])
            return NextResponse.json(
                { error: 'Failed to archive image' },
                { status: 500 }
            )
        }

        // Update metadata with new path and archived status
        const { data, error } = await supabase
            .from('image_metadata')
            .update({
                storage_path: archivePath,
                archived: true,
                archived_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', imageId)
            .eq('user_id', session.user.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating metadata for archive:', error)
            return NextResponse.json(
                { error: 'Failed to update archive metadata' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data
        })

    } catch (error) {
        console.error('Error archiving image:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

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

        // Get archived images
        const { data: archivedImages, error } = await supabase
            .from('image_metadata')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('archived', true)
            .order('archived_at', { ascending: false })

        if (error) {
            console.error('Error fetching archived images:', error)
            return NextResponse.json(
                { error: 'Failed to fetch archived images' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: archivedImages || []
        })

    } catch (error) {
        console.error('Error fetching archived images:', error)
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
        const imageId = searchParams.get('imageId')

        if (!imageId) {
            return NextResponse.json(
                { error: 'Image ID required' },
                { status: 400 }
            )
        }

        // Verify user owns this archived image
        const { data: archivedImage } = await supabase
            .from('image_metadata')
            .select('*')
            .eq('id', imageId)
            .eq('user_id', session.user.id)
            .eq('archived', true)
            .single()

        if (!archivedImage) {
            return NextResponse.json(
                { error: 'Archived image not found or access denied' },
                { status: 404 }
            )
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('images')
            .remove([archivedImage.storage_path])

        if (storageError) {
            console.error('Error deleting archived image from storage:', storageError)
        }

        // Delete metadata
        const { error } = await supabase
            .from('image_metadata')
            .delete()
            .eq('id', imageId)
            .eq('user_id', session.user.id)

        if (error) {
            console.error('Error deleting archived image metadata:', error)
            return NextResponse.json(
                { error: 'Failed to delete archived image' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true
        })

    } catch (error) {
        console.error('Error deleting archived image:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}