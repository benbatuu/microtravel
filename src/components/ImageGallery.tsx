'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Image as ImageIcon,
    Trash2,
    Download,
    Eye,
    MoreVertical,
    Search,
    Filter,
    Grid3X3,
    List,
    Calendar,
    FileImage,
    AlertCircle,
    CheckCircle2,
    X,
    Loader2
} from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { getUserImages, deleteImage, formatBytes, type ImageMetadata } from '@/lib/storage-management'

interface ImageGalleryProps {
    experienceId?: string
    showBulkActions?: boolean
    selectable?: boolean
    onImageSelect?: (images: ImageMetadata[]) => void
    className?: string
}

type ViewMode = 'grid' | 'list'
type SortBy = 'date' | 'name' | 'size'
type FilterBy = 'all' | 'recent' | 'large' | 'small'

export function ImageGallery({
    experienceId,
    showBulkActions = true,
    selectable = false,
    onImageSelect,
    className = ''
}: ImageGalleryProps) {
    const { user, profile } = useAuth()
    const [images, setImages] = useState<ImageMetadata[]>([])
    const [filteredImages, setFilteredImages] = useState<ImageMetadata[]>([])
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [sortBy, setSortBy] = useState<SortBy>('date')
    const [filterBy, setFilterBy] = useState<FilterBy>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [imagesToDelete, setImagesToDelete] = useState<ImageMetadata[]>([])
    const [deleting, setDeleting] = useState(false)

    // Load images
    useEffect(() => {
        if (user) {
            loadImages()
        }
    }, [user, experienceId])

    // Filter and sort images
    useEffect(() => {
        let filtered = [...images]

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(img =>
                img.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                img.filename.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply category filter
        switch (filterBy) {
            case 'recent':
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                filtered = filtered.filter(img => new Date(img.upload_date) > weekAgo)
                break
            case 'large':
                filtered = filtered.filter(img => img.size_bytes > 1024 * 1024) // > 1MB
                break
            case 'small':
                filtered = filtered.filter(img => img.size_bytes <= 1024 * 1024) // <= 1MB
                break
        }

        // Apply sorting
        switch (sortBy) {
            case 'date':
                filtered.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
                break
            case 'name':
                filtered.sort((a, b) => a.original_name.localeCompare(b.original_name))
                break
            case 'size':
                filtered.sort((a, b) => b.size_bytes - a.size_bytes)
                break
        }

        setFilteredImages(filtered)
    }, [images, searchQuery, filterBy, sortBy])

    // Notify parent of selection changes
    useEffect(() => {
        if (onImageSelect) {
            const selected = images.filter(img => selectedImages.has(img.id))
            onImageSelect(selected)
        }
    }, [selectedImages, images, onImageSelect])

    const loadImages = async () => {
        if (!user) return

        try {
            setLoading(true)
            setError(null)
            const imageList = await getUserImages(user.id, experienceId)
            setImages(imageList)
        } catch (err) {
            console.error('Error loading images:', err)
            setError('Failed to load images')
        } finally {
            setLoading(false)
        }
    }

    const handleImageSelect = useCallback((imageId: string, selected: boolean) => {
        setSelectedImages(prev => {
            const newSet = new Set(prev)
            if (selected) {
                newSet.add(imageId)
            } else {
                newSet.delete(imageId)
            }
            return newSet
        })
    }, [])

    const handleSelectAll = useCallback((selected: boolean) => {
        if (selected) {
            setSelectedImages(new Set(filteredImages.map(img => img.id)))
        } else {
            setSelectedImages(new Set())
        }
    }, [filteredImages])

    const handleDeleteImages = async (imagesToDelete: ImageMetadata[]) => {
        if (!user) return

        try {
            setDeleting(true)

            for (const image of imagesToDelete) {
                await deleteImage(user.id, image.storage_path)
            }

            // Refresh images list
            await loadImages()

            // Clear selection
            setSelectedImages(new Set())
            setDeleteConfirmOpen(false)
            setImagesToDelete([])
        } catch (err) {
            console.error('Error deleting images:', err)
            setError('Failed to delete images')
        } finally {
            setDeleting(false)
        }
    }

    const openDeleteConfirm = (images: ImageMetadata[]) => {
        setImagesToDelete(images)
        setDeleteConfirmOpen(true)
    }

    const downloadImage = async (image: ImageMetadata) => {
        try {
            const response = await fetch(`/api/storage/download?path=${encodeURIComponent(image.storage_path)}`)
            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = image.original_name
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (err) {
            console.error('Error downloading image:', err)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const isPremiumUser = profile?.subscription_tier !== 'free'

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Image Gallery
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {images.length} images • {formatBytes(images.reduce((sum, img) => sum + img.size_bytes, 0))}
                        </p>
                    </div>

                    {/* View Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search images..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setFilterBy('all')}>
                                    All Images
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterBy('recent')}>
                                    Recent (7 days)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterBy('large')}>
                                    Large (&gt; 1MB)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilterBy('small')}>
                                    Small (&le; 1MB)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Sort: {sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : 'Size'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setSortBy('date')}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Date
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy('name')}>
                                    <FileImage className="h-4 w-4 mr-2" />
                                    Name
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortBy('size')}>
                                    Size
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Bulk Actions */}
                {showBulkActions && selectedImages.size > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">
                            {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                            {isPremiumUser && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const selected = images.filter(img => selectedImages.has(img.id))
                                        // Implement bulk download
                                    }}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    const selected = images.filter(img => selectedImages.has(img.id))
                                    openDeleteConfirm(selected)
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {filteredImages.length === 0 ? (
                    <div className="text-center py-12">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            {searchQuery || filterBy !== 'all'
                                ? 'No images match your search criteria'
                                : 'No images uploaded yet'
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Select All */}
                        {(selectable || showBulkActions) && (
                            <div className="flex items-center gap-2 mb-4">
                                <Checkbox
                                    checked={selectedImages.size === filteredImages.length && filteredImages.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <span className="text-sm text-muted-foreground">
                                    Select all visible images
                                </span>
                            </div>
                        )}

                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredImages.map((image) => (
                                    <div key={image.id} className="relative group">
                                        {(selectable || showBulkActions) && (
                                            <Checkbox
                                                className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm"
                                                checked={selectedImages.has(image.id)}
                                                onCheckedChange={(checked) =>
                                                    handleImageSelect(image.id, checked as boolean)
                                                }
                                            />
                                        )}

                                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.storage_path}`}
                                                alt={image.original_name}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                            />

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                            {/* Actions */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => setSelectedImage(image)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => downloadImage(image)}>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteConfirm([image])}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Image Info */}
                                        <div className="mt-2">
                                            <p className="text-xs font-medium truncate">
                                                {image.original_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatBytes(image.size_bytes)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <div className="space-y-2">
                                {filteredImages.map((image) => (
                                    <div key={image.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50">
                                        {(selectable || showBulkActions) && (
                                            <Checkbox
                                                checked={selectedImages.has(image.id)}
                                                onCheckedChange={(checked) =>
                                                    handleImageSelect(image.id, checked as boolean)
                                                }
                                            />
                                        )}

                                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.storage_path}`}
                                                alt={image.original_name}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{image.original_name}</p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{formatBytes(image.size_bytes)}</span>
                                                <span>{formatDate(image.upload_date)}</span>
                                                {image.width && image.height && (
                                                    <span>{image.width} × {image.height}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setSelectedImage(image)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => downloadImage(image)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openDeleteConfirm([image])}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>

            {/* Image Preview Dialog */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-4xl">
                    {selectedImage && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedImage.original_name}</DialogTitle>
                            </DialogHeader>
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${selectedImage.storage_path}`}
                                    alt={selectedImage.original_name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 1024px) 100vw, 1024px"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Size:</span> {formatBytes(selectedImage.size_bytes)}
                                </div>
                                <div>
                                    <span className="font-medium">Uploaded:</span> {formatDate(selectedImage.upload_date)}
                                </div>
                                {selectedImage.width && selectedImage.height && (
                                    <div>
                                        <span className="font-medium">Dimensions:</span> {selectedImage.width} × {selectedImage.height}
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium">Type:</span> {selectedImage.mime_type}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Images</DialogTitle>
                    </DialogHeader>
                    <div>
                        <p className="mb-4">
                            Are you sure you want to delete {imagesToDelete.length} image{imagesToDelete.length !== 1 ? 's' : ''}?
                            This action cannot be undone.
                        </p>
                        {imagesToDelete.length <= 5 && (
                            <div className="space-y-2">
                                {imagesToDelete.map((image) => (
                                    <div key={image.id} className="flex items-center gap-2 text-sm">
                                        <FileImage className="h-4 w-4" />
                                        <span className="truncate">{image.original_name}</span>
                                        <span className="text-muted-foreground">({formatBytes(image.size_bytes)})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleDeleteImages(imagesToDelete)}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}