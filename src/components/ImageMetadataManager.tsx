'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Info,
    Edit,
    Save,
    X,
    Calendar,
    FileImage,
    Ruler,
    HardDrive,
    Tag,
    MapPin,
    Camera
} from 'lucide-react'
import { formatBytes, type ImageMetadata } from '@/lib/storage-management'
import { useAuth } from '@/hooks/useAuth'

interface ImageMetadataManagerProps {
    images: ImageMetadata[]
    onMetadataUpdate?: (imageId: string, metadata: Partial<ImageMetadata>) => void
    showBulkEdit?: boolean
    className?: string
}

interface ExtendedImageMetadata extends ImageMetadata {
    tags?: string[]
    description?: string
    location?: string
    camera_info?: {
        make?: string
        model?: string
        iso?: number
        aperture?: string
        shutter_speed?: string
        focal_length?: string
    }
}

export function ImageMetadataManager({
    images,
    onMetadataUpdate,
    showBulkEdit = true,
    className = ''
}: ImageMetadataManagerProps) {
    const { profile } = useAuth()
    const [selectedImage, setSelectedImage] = useState<ExtendedImageMetadata | null>(null)
    const [editingImage, setEditingImage] = useState<ExtendedImageMetadata | null>(null)
    const [bulkEditOpen, setBulkEditOpen] = useState(false)
    const [bulkTags, setBulkTags] = useState('')
    const [bulkLocation, setBulkLocation] = useState('')
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())

    const isPremiumUser = profile?.subscription_tier !== 'free'

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getFileTypeIcon = (mimeType: string) => {
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return '🖼️'
        if (mimeType.includes('png')) return '🖼️'
        if (mimeType.includes('gif')) return '🎞️'
        if (mimeType.includes('webp')) return '🖼️'
        return '📄'
    }

    const handleSaveMetadata = async (imageId: string, metadata: Partial<ExtendedImageMetadata>) => {
        try {
            const response = await fetch('/api/images/metadata', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageId,
                    metadata
                })
            })

            if (response.ok) {
                onMetadataUpdate?.(imageId, metadata)
                setEditingImage(null)
            }
        } catch (error) {
            console.error('Error updating metadata:', error)
        }
    }

    const handleBulkUpdate = async () => {
        if (selectedImages.size === 0) return

        const updates = {
            ...(bulkTags && { tags: bulkTags.split(',').map(tag => tag.trim()) }),
            ...(bulkLocation && { location: bulkLocation })
        }

        try {
            const response = await fetch('/api/images/metadata/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageIds: Array.from(selectedImages),
                    metadata: updates
                })
            })

            if (response.ok) {
                // Refresh data
                setBulkEditOpen(false)
                setSelectedImages(new Set())
                setBulkTags('')
                setBulkLocation('')
            }
        } catch (error) {
            console.error('Error bulk updating metadata:', error)
        }
    }

    const extractExifData = async (file: File): Promise<any> => {
        // This would typically use a library like exif-js or piexifjs
        // For now, return mock data
        return {
            make: 'Canon',
            model: 'EOS R5',
            iso: 400,
            aperture: 'f/2.8',
            shutter_speed: '1/125',
            focal_length: '85mm'
        }
    }

    return (
        <div className={className}>
            {/* Summary Stats */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Image Collection Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{images.length}</div>
                            <div className="text-sm text-muted-foreground">Total Images</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {formatBytes(images.reduce((sum, img) => sum + img.size_bytes, 0))}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Size</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {new Set(images.map(img => img.mime_type)).size}
                            </div>
                            <div className="text-sm text-muted-foreground">File Types</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {images.filter(img => new Date(img.upload_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Recent (7d)</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Edit Actions */}
            {showBulkEdit && isPremiumUser && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                Bulk Operations
                            </div>
                            <Badge variant="secondary">Premium</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setBulkEditOpen(true)}
                                disabled={selectedImages.size === 0}
                            >
                                Edit Metadata ({selectedImages.size})
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedImages(new Set())}
                                disabled={selectedImages.size === 0}
                            >
                                Clear Selection
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Images Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Image Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {showBulkEdit && isPremiumUser && (
                                    <TableHead className="w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedImages.size === images.length && images.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedImages(new Set(images.map(img => img.id)))
                                                } else {
                                                    setSelectedImages(new Set())
                                                }
                                            }}
                                        />
                                    </TableHead>
                                )}
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Dimensions</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Uploaded</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {images.map((image) => (
                                <TableRow key={image.id}>
                                    {showBulkEdit && isPremiumUser && (
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedImages.has(image.id)}
                                                onChange={(e) => {
                                                    const newSet = new Set(selectedImages)
                                                    if (e.target.checked) {
                                                        newSet.add(image.id)
                                                    } else {
                                                        newSet.delete(image.id)
                                                    }
                                                    setSelectedImages(newSet)
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getFileTypeIcon(image.mime_type)}</span>
                                            <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${image.storage_path}`}
                                                    alt={image.original_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium truncate max-w-[200px]">
                                                {image.original_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {image.filename}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatBytes(image.size_bytes)}</TableCell>
                                    <TableCell>
                                        {image.width && image.height ? (
                                            <div className="flex items-center gap-1">
                                                <Ruler className="h-3 w-3" />
                                                {image.width} × {image.height}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {image.mime_type.split('/')[1].toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(image.upload_date)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setSelectedImage(image as ExtendedImageMetadata)}
                                                    >
                                                        <Info className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Image Metadata</DialogTitle>
                                                    </DialogHeader>
                                                    {selectedImage && (
                                                        <div className="space-y-4">
                                                            {/* Image Preview */}
                                                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                                                                <img
                                                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${selectedImage.storage_path}`}
                                                                    alt={selectedImage.original_name}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>

                                                            {/* Basic Info */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label className="text-sm font-medium">File Name</Label>
                                                                    <p className="text-sm">{selectedImage.original_name}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium">File Size</Label>
                                                                    <p className="text-sm">{formatBytes(selectedImage.size_bytes)}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium">Dimensions</Label>
                                                                    <p className="text-sm">
                                                                        {selectedImage.width && selectedImage.height
                                                                            ? `${selectedImage.width} × ${selectedImage.height}`
                                                                            : 'Unknown'
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium">Type</Label>
                                                                    <p className="text-sm">{selectedImage.mime_type}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium">Uploaded</Label>
                                                                    <p className="text-sm">{formatDate(selectedImage.upload_date)}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium">Experience</Label>
                                                                    <p className="text-sm">
                                                                        {selectedImage.experience_id ? 'Linked' : 'Unassigned'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Extended Metadata (Premium) */}
                                                            {isPremiumUser && (
                                                                <>
                                                                    <Separator />
                                                                    <div className="space-y-4">
                                                                        <h4 className="font-medium">Extended Metadata</h4>

                                                                        {selectedImage.tags && (
                                                                            <div>
                                                                                <Label className="text-sm font-medium">Tags</Label>
                                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                                    {selectedImage.tags.map((tag, index) => (
                                                                                        <Badge key={index} variant="secondary">
                                                                                            {tag}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {selectedImage.location && (
                                                                            <div>
                                                                                <Label className="text-sm font-medium">Location</Label>
                                                                                <p className="text-sm flex items-center gap-1">
                                                                                    <MapPin className="h-3 w-3" />
                                                                                    {selectedImage.location}
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {selectedImage.camera_info && (
                                                                            <div>
                                                                                <Label className="text-sm font-medium">Camera Info</Label>
                                                                                <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                                                                                    {selectedImage.camera_info.make && (
                                                                                        <div>Make: {selectedImage.camera_info.make}</div>
                                                                                    )}
                                                                                    {selectedImage.camera_info.model && (
                                                                                        <div>Model: {selectedImage.camera_info.model}</div>
                                                                                    )}
                                                                                    {selectedImage.camera_info.iso && (
                                                                                        <div>ISO: {selectedImage.camera_info.iso}</div>
                                                                                    )}
                                                                                    {selectedImage.camera_info.aperture && (
                                                                                        <div>Aperture: {selectedImage.camera_info.aperture}</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>

                                            {isPremiumUser && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingImage(image as ExtendedImageMetadata)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Bulk Edit Dialog */}
            <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Edit Metadata</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="bulk-tags">Tags (comma-separated)</Label>
                            <Input
                                id="bulk-tags"
                                value={bulkTags}
                                onChange={(e) => setBulkTags(e.target.value)}
                                placeholder="travel, vacation, landscape"
                            />
                        </div>
                        <div>
                            <Label htmlFor="bulk-location">Location</Label>
                            <Input
                                id="bulk-location"
                                value={bulkLocation}
                                onChange={(e) => setBulkLocation(e.target.value)}
                                placeholder="Paris, France"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This will update metadata for {selectedImages.size} selected images.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkUpdate}>
                            Update Metadata
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Single Image Dialog */}
            <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Image Metadata</DialogTitle>
                    </DialogHeader>
                    {editingImage && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-tags">Tags</Label>
                                <Input
                                    id="edit-tags"
                                    value={editingImage.tags?.join(', ') || ''}
                                    onChange={(e) => setEditingImage({
                                        ...editingImage,
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                    })}
                                    placeholder="travel, vacation, landscape"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-location">Location</Label>
                                <Input
                                    id="edit-location"
                                    value={editingImage.location || ''}
                                    onChange={(e) => setEditingImage({
                                        ...editingImage,
                                        location: e.target.value
                                    })}
                                    placeholder="Paris, France"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editingImage.description || ''}
                                    onChange={(e) => setEditingImage({
                                        ...editingImage,
                                        description: e.target.value
                                    })}
                                    placeholder="Describe this image..."
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingImage(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => editingImage && handleSaveMetadata(editingImage.id, editingImage)}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}