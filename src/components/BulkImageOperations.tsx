'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Download,
    Trash2,
    Archive,
    Move,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Package,
    Zap
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { formatBytes, type ImageMetadata } from '@/lib/storage-management'
import JSZip from 'jszip'

interface BulkImageOperationsProps {
    selectedImages: ImageMetadata[]
    onOperationComplete?: () => void
    onClearSelection?: () => void
}

type BulkOperation = 'download' | 'delete' | 'move' | 'archive'

interface OperationProgress {
    operation: BulkOperation
    current: number
    total: number
    completed: boolean
    error?: string
}

export function BulkImageOperations({
    selectedImages,
    onOperationComplete,
    onClearSelection
}: BulkImageOperationsProps) {
    const { profile } = useAuth()
    const [operationInProgress, setOperationInProgress] = useState<OperationProgress | null>(null)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [pendingOperation, setPendingOperation] = useState<BulkOperation | null>(null)
    const [moveToExperience, setMoveToExperience] = useState<string>('')

    const isPremiumUser = profile?.subscription_tier !== 'free'
    const totalSize = selectedImages.reduce((sum, img) => sum + img.size_bytes, 0)

    const handleBulkOperation = async (operation: BulkOperation) => {
        if (!isPremiumUser && operation !== 'delete') {
            return // Only allow delete for free users
        }

        if (operation === 'delete') {
            setPendingOperation(operation)
            setConfirmDialogOpen(true)
            return
        }

        await executeBulkOperation(operation)
    }

    const executeBulkOperation = async (operation: BulkOperation) => {
        setOperationInProgress({
            operation,
            current: 0,
            total: selectedImages.length,
            completed: false
        })

        try {
            switch (operation) {
                case 'download':
                    await bulkDownload()
                    break
                case 'delete':
                    await bulkDelete()
                    break
                case 'move':
                    await bulkMove()
                    break
                case 'archive':
                    await bulkArchive()
                    break
            }

            setOperationInProgress(prev => prev ? { ...prev, completed: true } : null)
            onOperationComplete?.()
            onClearSelection?.()
        } catch (error) {
            setOperationInProgress(prev => prev ? {
                ...prev,
                error: error instanceof Error ? error.message : 'Operation failed'
            } : null)
        }
    }

    const bulkDownload = async () => {
        const zip = new JSZip()

        for (let i = 0; i < selectedImages.length; i++) {
            const image = selectedImages[i]

            try {
                // Fetch image data
                const response = await fetch(`/api/storage/download?path=${encodeURIComponent(image.storage_path)}`)
                if (response.ok) {
                    const blob = await response.blob()
                    zip.file(image.original_name, blob)
                }

                setOperationInProgress(prev => prev ? { ...prev, current: i + 1 } : null)
            } catch (error) {
                console.error(`Failed to download ${image.original_name}:`, error)
            }
        }

        // Generate and download zip file
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = window.URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `images-${new Date().toISOString().split('T')[0]}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
    }

    const bulkDelete = async () => {
        for (let i = 0; i < selectedImages.length; i++) {
            const image = selectedImages[i]

            try {
                const response = await fetch(`/api/images/upload?path=${encodeURIComponent(image.storage_path)}`, {
                    method: 'DELETE'
                })

                if (!response.ok) {
                    throw new Error(`Failed to delete ${image.original_name}`)
                }

                setOperationInProgress(prev => prev ? { ...prev, current: i + 1 } : null)
            } catch (error) {
                console.error(`Failed to delete ${image.original_name}:`, error)
            }
        }
    }

    const bulkMove = async () => {
        if (!moveToExperience) return

        for (let i = 0; i < selectedImages.length; i++) {
            const image = selectedImages[i]

            try {
                const response = await fetch('/api/images/move', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageId: image.id,
                        experienceId: moveToExperience
                    })
                })

                if (!response.ok) {
                    throw new Error(`Failed to move ${image.original_name}`)
                }

                setOperationInProgress(prev => prev ? { ...prev, current: i + 1 } : null)
            } catch (error) {
                console.error(`Failed to move ${image.original_name}:`, error)
            }
        }
    }

    const bulkArchive = async () => {
        // Implementation for archiving images
        // This could involve moving to an archive folder or marking as archived
        for (let i = 0; i < selectedImages.length; i++) {
            const image = selectedImages[i]

            try {
                const response = await fetch('/api/images/archive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageId: image.id
                    })
                })

                if (!response.ok) {
                    throw new Error(`Failed to archive ${image.original_name}`)
                }

                setOperationInProgress(prev => prev ? { ...prev, current: i + 1 } : null)
            } catch (error) {
                console.error(`Failed to archive ${image.original_name}:`, error)
            }
        }
    }

    const getOperationLabel = (operation: BulkOperation) => {
        switch (operation) {
            case 'download': return 'Downloading'
            case 'delete': return 'Deleting'
            case 'move': return 'Moving'
            case 'archive': return 'Archiving'
        }
    }

    if (selectedImages.length === 0) {
        return null
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Bulk Operations
                        </div>
                        <Badge variant="secondary">
                            {selectedImages.length} selected
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Selection Summary */}
                    <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Selected Images</span>
                            <span className="text-sm text-muted-foreground">
                                {formatBytes(totalSize)}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                        </div>
                    </div>

                    {/* Premium Feature Notice */}
                    {!isPremiumUser && (
                        <Alert>
                            <Zap className="h-4 w-4" />
                            <AlertDescription>
                                Bulk operations (except delete) are available for premium users only.
                                <Button variant="link" className="p-0 h-auto ml-1">
                                    Upgrade now
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Operation Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleBulkOperation('download')}
                            disabled={!isPremiumUser || !!operationInProgress}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download All
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleBulkOperation('move')}
                            disabled={!isPremiumUser || !!operationInProgress}
                            className="flex items-center gap-2"
                        >
                            <Move className="h-4 w-4" />
                            Move
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleBulkOperation('archive')}
                            disabled={!isPremiumUser || !!operationInProgress}
                            className="flex items-center gap-2"
                        >
                            <Archive className="h-4 w-4" />
                            Archive
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => handleBulkOperation('delete')}
                            disabled={!!operationInProgress}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete All
                        </Button>
                    </div>

                    {/* Operation Progress */}
                    {operationInProgress && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {getOperationLabel(operationInProgress.operation)} images...
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {operationInProgress.current} / {operationInProgress.total}
                                </span>
                            </div>
                            <Progress
                                value={(operationInProgress.current / operationInProgress.total) * 100}
                            />

                            {operationInProgress.completed && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm">Operation completed successfully</span>
                                </div>
                            )}

                            {operationInProgress.error && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">{operationInProgress.error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Clear Selection */}
                    <Button
                        variant="ghost"
                        onClick={onClearSelection}
                        disabled={!!operationInProgress}
                        className="w-full"
                    >
                        Clear Selection
                    </Button>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Bulk Operation</DialogTitle>
                    </DialogHeader>
                    <div>
                        <p className="mb-4">
                            {pendingOperation === 'delete' && (
                                <>
                                    Are you sure you want to delete {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}?
                                    This action cannot be undone and will free up {formatBytes(totalSize)} of storage.
                                </>
                            )}
                        </p>

                        {pendingOperation === 'move' && (
                            <div className="space-y-4">
                                <p>Select the experience to move these images to:</p>
                                <Select value={moveToExperience} onValueChange={setMoveToExperience}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select experience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {/* Add experience options here */}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setConfirmDialogOpen(false)
                                setPendingOperation(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={pendingOperation === 'delete' ? 'destructive' : 'default'}
                            onClick={() => {
                                if (pendingOperation) {
                                    executeBulkOperation(pendingOperation)
                                }
                                setConfirmDialogOpen(false)
                                setPendingOperation(null)
                            }}
                            disabled={pendingOperation === 'move' && !moveToExperience}
                        >
                            {pendingOperation === 'delete' ? 'Delete' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}