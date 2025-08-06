import { supabase, supabaseAdmin } from './supabaseClient'
import { subscriptionTiers } from './stripe'
import { validateUserAction, trackUsage } from './subscription-validation'

export interface StorageQuota {
    used: number // bytes
    limit: number // bytes (-1 for unlimited)
    remaining: number // bytes (-1 for unlimited)
    percentage: number // 0-100
    canUpload: boolean
}

export interface ImageUploadResult {
    success: boolean
    url?: string
    error?: string
    sizeBytes?: number
}

export interface ImageMetadata {
    id: string
    user_id: string
    filename: string
    original_name: string
    size_bytes: number
    mime_type: string
    width?: number
    height?: number
    experience_id?: string
    upload_date: string
    storage_path: string
}

/**
 * Get storage quota information for a user
 */
export async function getStorageQuota(userId: string): Promise<StorageQuota> {
    try {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('subscription_tier, storage_used')
            .eq('id', userId)
            .single()

        if (!profile) {
            return {
                used: 0,
                limit: 0,
                remaining: 0,
                percentage: 100,
                canUpload: false
            }
        }

        const tier = subscriptionTiers[profile.subscription_tier || 'free']
        const used = profile.storage_used || 0
        const limit = tier.limits.storage

        // -1 means unlimited
        if (limit === -1) {
            return {
                used,
                limit: -1,
                remaining: -1,
                percentage: 0,
                canUpload: true
            }
        }

        const remaining = Math.max(0, limit - used)
        const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 100

        return {
            used,
            limit,
            remaining,
            percentage,
            canUpload: remaining > 0
        }
    } catch (error) {
        console.error('Error getting storage quota:', error)
        return {
            used: 0,
            limit: 0,
            remaining: 0,
            percentage: 100,
            canUpload: false
        }
    }
}

/**
 * Check if user can upload a file of given size
 */
export async function canUploadFile(userId: string, fileSizeBytes: number): Promise<{
    canUpload: boolean
    reason?: string
    quota: StorageQuota
}> {
    const quota = await getStorageQuota(userId)

    if (quota.limit === -1) {
        return { canUpload: true, quota }
    }

    if (quota.remaining < fileSizeBytes) {
        return {
            canUpload: false,
            reason: `File size (${formatBytes(fileSizeBytes)}) exceeds remaining storage (${formatBytes(quota.remaining)})`,
            quota
        }
    }

    return { canUpload: true, quota }
}

/**
 * Update user's storage usage
 */
export async function updateStorageUsage(userId: string, bytesChange: number): Promise<boolean> {
    try {
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('storage_used')
            .eq('id', userId)
            .single()

        if (!profile) {
            return false
        }

        const newUsage = Math.max(0, (profile.storage_used || 0) + bytesChange)

        await supabaseAdmin
            .from('profiles')
            .update({
                storage_used: newUsage,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        return true
    } catch (error) {
        console.error('Error updating storage usage:', error)
        return false
    }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): {
    isValid: boolean
    errors: string[]
    warnings: string[]
} {
    const errors: string[] = []
    const warnings: string[] = []

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Check file size (max 10MB per file)
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxFileSize) {
        errors.push(`File size (${formatBytes(file.size)}) exceeds maximum allowed size (${formatBytes(maxFileSize)})`)
    }

    // Warnings for large files
    const warningSize = 5 * 1024 * 1024 // 5MB
    if (file.size > warningSize && file.size <= maxFileSize) {
        warnings.push(`Large file size (${formatBytes(file.size)}). Consider compressing the image for better performance.`)
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

/**
 * Compress image file
 */
export async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img
            if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
            }

            canvas.width = width
            canvas.height = height

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height)

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        })
                        resolve(compressedFile)
                    } else {
                        reject(new Error('Failed to compress image'))
                    }
                },
                file.type,
                quality
            )
        }

        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = URL.createObjectURL(file)
    })
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
    file: File,
    userId: string,
    experienceId?: string,
    compress: boolean = true
): Promise<ImageUploadResult> {
    try {
        // Validate file
        const validation = validateImageFile(file)
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.errors.join(', ')
            }
        }

        // Check storage quota
        const uploadCheck = await canUploadFile(userId, file.size)
        if (!uploadCheck.canUpload) {
            return {
                success: false,
                error: uploadCheck.reason || 'Storage quota exceeded'
            }
        }

        // Compress image if requested and file is large
        let fileToUpload = file
        if (compress && file.size > 1024 * 1024) { // 1MB
            try {
                fileToUpload = await compressImage(file)
            } catch (error) {
                console.warn('Image compression failed, uploading original:', error)
            }
        }

        // Generate unique filename
        const fileExt = fileToUpload.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, fileToUpload, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            return {
                success: false,
                error: `Upload failed: ${error.message}`
            }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName)

        // Update storage usage
        await updateStorageUsage(userId, fileToUpload.size)

        // Track usage
        await trackUsage(userId, 'image_upload', 1)

        // Store image metadata (if we have an images table)
        try {
            await supabaseAdmin
                .from('image_metadata')
                .insert({
                    user_id: userId,
                    filename: fileName,
                    original_name: file.name,
                    size_bytes: fileToUpload.size,
                    mime_type: fileToUpload.type,
                    experience_id: experienceId,
                    storage_path: data.path,
                    upload_date: new Date().toISOString()
                })
        } catch (metadataError) {
            console.warn('Failed to store image metadata:', metadataError)
        }

        return {
            success: true,
            url: publicUrl,
            sizeBytes: fileToUpload.size
        }
    } catch (error) {
        console.error('Error uploading image:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
    }
}

/**
 * Delete image from storage
 */
export async function deleteImage(userId: string, imagePath: string): Promise<boolean> {
    try {
        // Get image metadata to know the size
        const { data: metadata } = await supabaseAdmin
            .from('image_metadata')
            .select('size_bytes')
            .eq('user_id', userId)
            .eq('storage_path', imagePath)
            .single()

        // Delete from storage
        const { error } = await supabase.storage
            .from('images')
            .remove([imagePath])

        if (error) {
            console.error('Error deleting image from storage:', error)
            return false
        }

        // Update storage usage
        if (metadata?.size_bytes) {
            await updateStorageUsage(userId, -metadata.size_bytes)
        }

        // Delete metadata
        await supabaseAdmin
            .from('image_metadata')
            .delete()
            .eq('user_id', userId)
            .eq('storage_path', imagePath)

        return true
    } catch (error) {
        console.error('Error deleting image:', error)
        return false
    }
}

/**
 * Get user's images with metadata
 */
export async function getUserImages(userId: string, experienceId?: string): Promise<ImageMetadata[]> {
    try {
        let query = supabaseAdmin
            .from('image_metadata')
            .select('*')
            .eq('user_id', userId)
            .order('upload_date', { ascending: false })

        if (experienceId) {
            query = query.eq('experience_id', experienceId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching user images:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error getting user images:', error)
        return []
    }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes'
    if (bytes === -1) return 'Unlimited'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Calculate storage usage percentage
 */
export function calculateStoragePercentage(used: number, limit: number): number {
    if (limit === -1) return 0 // Unlimited
    if (limit === 0) return 100
    return Math.min((used / limit) * 100, 100)
}

/**
 * Get suggested upgrade tier for storage needs
 */
export function getSuggestedTierForStorage(currentTier: string, requiredBytes: number): string | null {
    const tierHierarchy = ['free', 'explorer', 'traveler', 'enterprise']
    const currentIndex = tierHierarchy.indexOf(currentTier)

    for (let i = currentIndex + 1; i < tierHierarchy.length; i++) {
        const tier = subscriptionTiers[tierHierarchy[i]]
        if (tier.limits.storage === -1 || tier.limits.storage >= requiredBytes) {
            return tierHierarchy[i]
        }
    }

    return null
}