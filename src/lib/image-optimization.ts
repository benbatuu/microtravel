/**
 * Image optimization and compression utilities
 */

export interface CompressionOptions {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
    maintainAspectRatio?: boolean
}

export interface ImageDimensions {
    width: number
    height: number
}

export interface OptimizationResult {
    file: File
    originalSize: number
    compressedSize: number
    compressionRatio: number
    dimensions: ImageDimensions
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            })
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Failed to load image'))
        }

        img.src = url
    })
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
export function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number
): ImageDimensions {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // If no constraints, return original dimensions
    if (!maxWidth && !maxHeight) {
        return { width, height }
    }

    // Calculate aspect ratio
    const aspectRatio = width / height

    // Apply width constraint
    if (maxWidth && width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
    }

    // Apply height constraint
    if (maxHeight && height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
    }

    return {
        width: Math.round(width),
        height: Math.round(height)
    }
}

/**
 * Compress image using canvas
 */
export function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<OptimizationResult> {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        format = 'jpeg',
        maintainAspectRatio = true
    } = options

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
        }

        img.onload = () => {
            try {
                // Calculate new dimensions
                const newDimensions = maintainAspectRatio
                    ? calculateDimensions(img.width, img.height, maxWidth, maxHeight)
                    : { width: maxWidth || img.width, height: maxHeight || img.height }

                // Set canvas dimensions
                canvas.width = newDimensions.width
                canvas.height = newDimensions.height

                // Draw image on canvas with new dimensions
                ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height)

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'))
                            return
                        }

                        // Create new file
                        const compressedFile = new File([blob], file.name, {
                            type: blob.type,
                            lastModified: Date.now()
                        })

                        const compressionRatio = (1 - blob.size / file.size) * 100

                        resolve({
                            file: compressedFile,
                            originalSize: file.size,
                            compressedSize: blob.size,
                            compressionRatio,
                            dimensions: newDimensions
                        })
                    },
                    format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg',
                    quality
                )
            } catch (error) {
                reject(error)
            }
        }

        img.onerror = () => {
            reject(new Error('Failed to load image'))
        }

        img.src = URL.createObjectURL(file)
    })
}

/**
 * Auto-optimize image based on file size and dimensions
 */
export async function autoOptimizeImage(file: File): Promise<OptimizationResult> {
    const dimensions = await getImageDimensions(file)
    const fileSizeMB = file.size / (1024 * 1024)

    // Determine optimization strategy based on file size and dimensions
    let options: CompressionOptions = {}

    if (fileSizeMB > 5) {
        // Large files: aggressive compression
        options = {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.7,
            format: 'jpeg'
        }
    } else if (fileSizeMB > 2) {
        // Medium files: moderate compression
        options = {
            maxWidth: 2560,
            maxHeight: 1440,
            quality: 0.8,
            format: 'jpeg'
        }
    } else if (dimensions.width > 3000 || dimensions.height > 3000) {
        // High resolution: resize only
        options = {
            maxWidth: 2560,
            maxHeight: 1440,
            quality: 0.9
        }
    } else {
        // Small files: minimal compression
        options = {
            quality: 0.9
        }
    }

    return compressImage(file, options)
}

/**
 * Create image thumbnail
 */
export function createThumbnail(
    file: File,
    size: number = 200,
    quality: number = 0.8
): Promise<OptimizationResult> {
    return compressImage(file, {
        maxWidth: size,
        maxHeight: size,
        quality,
        format: 'jpeg',
        maintainAspectRatio: true
    })
}

/**
 * Batch optimize multiple images
 */
export async function batchOptimizeImages(
    files: File[],
    options: CompressionOptions = {},
    onProgress?: (completed: number, total: number) => void
): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = []

    for (let i = 0; i < files.length; i++) {
        try {
            const result = await compressImage(files[i], options)
            results.push(result)
            onProgress?.(i + 1, files.length)
        } catch (error) {
            console.error(`Failed to optimize image ${files[i].name}:`, error)
            // Create a fallback result with original file
            results.push({
                file: files[i],
                originalSize: files[i].size,
                compressedSize: files[i].size,
                compressionRatio: 0,
                dimensions: await getImageDimensions(files[i]).catch(() => ({ width: 0, height: 0 }))
            })
        }
    }

    return results
}

/**
 * Check if image needs optimization
 */
export async function shouldOptimizeImage(file: File): Promise<{
    shouldOptimize: boolean
    reasons: string[]
    estimatedSavings?: number
}> {
    const reasons: string[] = []
    const fileSizeMB = file.size / (1024 * 1024)

    try {
        const dimensions = await getImageDimensions(file)

        // Check file size
        if (fileSizeMB > 2) {
            reasons.push(`Large file size (${fileSizeMB.toFixed(1)}MB)`)
        }

        // Check dimensions
        if (dimensions.width > 2560 || dimensions.height > 1440) {
            reasons.push(`High resolution (${dimensions.width}x${dimensions.height})`)
        }

        // Check format
        if (file.type === 'image/png' && fileSizeMB > 1) {
            reasons.push('PNG format with large size (consider JPEG)')
        }

        // Estimate potential savings
        let estimatedSavings = 0
        if (fileSizeMB > 2) {
            estimatedSavings = Math.min(fileSizeMB * 0.3, fileSizeMB - 0.5) // 30% savings or down to 0.5MB
        }

        return {
            shouldOptimize: reasons.length > 0,
            reasons,
            estimatedSavings: estimatedSavings > 0 ? estimatedSavings : undefined
        }
    } catch (error) {
        return {
            shouldOptimize: false,
            reasons: ['Unable to analyze image']
        }
    }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get compression ratio as percentage
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0
    return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
    const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
    ]
    return validTypes.includes(file.type)
}

/**
 * Get optimal format for image
 */
export function getOptimalFormat(file: File, hasTransparency: boolean = false): 'jpeg' | 'png' | 'webp' {
    // If image has transparency, use PNG
    if (hasTransparency) {
        return 'png'
    }

    // For photos, JPEG is usually better
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        return 'jpeg'
    }

    // WebP offers better compression but check browser support
    if (typeof window !== 'undefined') {
        const canvas = document.createElement('canvas')
        const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
        if (supportsWebP) {
            return 'webp'
        }
    }

    return 'jpeg'
}