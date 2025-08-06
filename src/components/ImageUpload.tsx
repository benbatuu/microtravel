'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { uploadImage, validateImageFile, formatBytes, canUploadFile } from '@/lib/storage-management'
import Image from 'next/image'

interface ImageUploadProps {
    onUploadComplete?: (url: string, metadata: { size: number; name: string }) => void
    onUploadError?: (error: string) => void
    experienceId?: string
    maxFiles?: number
    accept?: string
    disabled?: boolean
    showQuota?: boolean
    className?: string
}

interface UploadingFile {
    file: File
    progress: number
    status: 'uploading' | 'success' | 'error'
    url?: string
    error?: string
    id: string
}

export function ImageUpload({
    onUploadComplete,
    onUploadError,
    experienceId,
    maxFiles = 5,
    accept = 'image/*',
    disabled = false,
    showQuota = true,
    className = ''
}: ImageUploadProps) {
    const { user, getStorageUsagePercentage } = useAuth()
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [quota, setQuota] = useState<{ used: number; limit: number; percentage: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load quota on mount
    React.useEffect(() => {
        if (user && showQuota) {
            loadQuota()
        }
    }, [user, showQuota])

    const loadQuota = async () => {
        if (!user) return

        try {
            const { canUploadFile } = await import('@/lib/storage-management')
            const result = await canUploadFile(user.id, 0)
            setQuota({
                used: result.quota.used,
                limit: result.quota.limit,
                percentage: result.quota.percentage
            })
        } catch (error) {
            console.error('Error loading quota:', error)
        }
    }

    const handleFiles = useCallback(async (files: FileList) => {
        if (!user) {
            onUploadError?.('Please log in to upload images')
            return
        }

        const fileArray = Array.from(files)

        // Check max files limit
        if (uploadingFiles.length + fileArray.length > maxFiles) {
            onUploadError?.(`Maximum ${maxFiles} files allowed`)
            return
        }

        // Validate each file
        const validFiles: File[] = []
        for (const file of fileArray) {
            const validation = validateImageFile(file)
            if (!validation.isValid) {
                onUploadError?.(validation.errors.join(', '))
                continue
            }

            // Check quota for each file
            const quotaCheck = await canUploadFile(user.id, file.size)
            if (!quotaCheck.canUpload) {
                onUploadError?.(quotaCheck.reason || 'Storage quota exceeded')
                continue
            }

            validFiles.push(file)
        }

        if (validFiles.length === 0) return

        // Start uploading valid files
        const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
            file,
            progress: 0,
            status: 'uploading' as const,
            id: Math.random().toString(36).substring(2)
        }))

        setUploadingFiles(prev => [...prev, ...newUploadingFiles])

        // Upload files one by one
        for (const uploadingFile of newUploadingFiles) {
            try {
                // Simulate progress
                const progressInterval = setInterval(() => {
                    setUploadingFiles(prev => prev.map(f =>
                        f.id === uploadingFile.id
                            ? { ...f, progress: Math.min(f.progress + 10, 90) }
                            : f
                    ))
                }, 200)

                const result = await uploadImage(
                    uploadingFile.file,
                    user.id,
                    experienceId,
                    true // compress
                )

                clearInterval(progressInterval)

                if (result.success && result.url) {
                    setUploadingFiles(prev => prev.map(f =>
                        f.id === uploadingFile.id
                            ? { ...f, progress: 100, status: 'success', url: result.url }
                            : f
                    ))

                    onUploadComplete?.(result.url, {
                        size: result.sizeBytes || uploadingFile.file.size,
                        name: uploadingFile.file.name
                    })

                    // Refresh quota
                    await loadQuota()
                } else {
                    setUploadingFiles(prev => prev.map(f =>
                        f.id === uploadingFile.id
                            ? { ...f, status: 'error', error: result.error }
                            : f
                    ))

                    onUploadError?.(result.error || 'Upload failed')
                }
            } catch (error) {
                setUploadingFiles(prev => prev.map(f =>
                    f.id === uploadingFile.id
                        ? { ...f, status: 'error', error: 'Upload failed' }
                        : f
                ))

                onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
            }
        }
    }, [user, uploadingFiles.length, maxFiles, experienceId, onUploadComplete, onUploadError])

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
        }
    }, [handleFiles])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
        }
    }, [handleFiles])

    const removeFile = useCallback((id: string) => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id))
    }, [])

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Storage Quota Display */}
            {showQuota && quota && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Storage Usage</span>
                            <span className="text-sm text-muted-foreground">
                                {formatBytes(quota.used)} / {quota.limit === -1 ? 'Unlimited' : formatBytes(quota.limit)}
                            </span>
                        </div>
                        {quota.limit !== -1 && (
                            <Progress value={quota.percentage} className="h-2" />
                        )}
                        {quota.percentage > 80 && quota.limit !== -1 && (
                            <Alert className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Storage is {quota.percentage.toFixed(0)}% full. Consider upgrading your plan.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Upload Area */}
            <Card
                className={`border-2 border-dashed transition-colors ${dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={disabled ? undefined : openFileDialog}
            >
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-lg font-medium">
                                {dragActive ? 'Drop images here' : 'Upload Images'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Drag and drop or click to select files
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Supports JPEG, PNG, WebP, GIF • Max 10MB per file • Up to {maxFiles} files
                            </p>
                        </div>
                        <Button variant="outline" disabled={disabled}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Choose Files
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={accept}
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled}
            />

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploading Files</h4>
                    {uploadingFiles.map((file) => (
                        <Card key={file.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                    {/* File Preview */}
                                    <div className="flex-shrink-0">
                                        {file.url ? (
                                            <div className="relative w-12 h-12 rounded overflow-hidden">
                                                <Image
                                                    src={file.url}
                                                    alt={file.file.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {file.file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(file.file.size)}
                                        </p>

                                        {/* Progress Bar */}
                                        {file.status === 'uploading' && (
                                            <Progress value={file.progress} className="h-1 mt-2" />
                                        )}

                                        {/* Error Message */}
                                        {file.status === 'error' && file.error && (
                                            <p className="text-xs text-destructive mt-1">
                                                {file.error}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Icon */}
                                    <div className="flex-shrink-0">
                                        {file.status === 'uploading' && (
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        )}
                                        {file.status === 'success' && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Success
                                            </Badge>
                                        )}
                                        {file.status === 'error' && (
                                            <Badge variant="destructive">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Error
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeFile(file.id)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}