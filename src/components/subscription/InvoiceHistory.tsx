'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Receipt,
    Download,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw
} from 'lucide-react'
import { formatPrice } from '@/lib/stripe'

interface PaymentRecord {
    id: string
    user_id: string
    stripe_payment_intent_id: string | null
    amount: number
    currency: string
    status: string
    description: string | null
    created_at: string
}

interface InvoiceHistoryProps {
    userId: string
}

const statusIcons = {
    succeeded: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    processing: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
    canceled: <XCircle className="h-4 w-4 text-gray-500" />
}

const statusColors = {
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    canceled: 'bg-gray-100 text-gray-800'
}

export function InvoiceHistory({ userId }: InvoiceHistoryProps) {
    const [payments, setPayments] = useState<PaymentRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    const fetchPaymentHistory = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/stripe/payment-history?userId=${userId}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch payment history')
            }

            setPayments(data.payments || [])
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load payment history'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        fetchPaymentHistory()
    }, [fetchPaymentHistory])

    const handleDownloadInvoice = async (paymentId: string) => {
        if (!paymentId) return

        setDownloadingId(paymentId)

        try {
            // In a real implementation, you would fetch the invoice PDF from Stripe
            // For now, we'll simulate the download
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Create a mock PDF download
            const link = document.createElement('a')
            link.href = '#'
            link.download = `invoice-${paymentId}.pdf`
            link.click()

        } catch (err) {
            console.error('Failed to download invoice:', err)
        } finally {
            setDownloadingId(null)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStatusBadge = (status: string) => {
        const icon = statusIcons[status as keyof typeof statusIcons] || statusIcons.pending
        const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.pending

        return (
            <Badge variant="secondary" className={colorClass}>
                <div className="flex items-center gap-1">
                    {icon}
                    <span className="capitalize">{status}</span>
                </div>
            </Badge>
        )
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Payment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-gray-600">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading payment history...
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Payment History
                </CardTitle>
                <CardDescription>
                    View and download your payment receipts and invoices
                </CardDescription>
            </CardHeader>

            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {payments.length === 0 ? (
                    <div className="text-center py-8">
                        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                        <p className="text-gray-600">
                            Your payment history will appear here once you make your first payment.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {payments.filter(p => p.status === 'succeeded').length}
                                </div>
                                <div className="text-sm text-gray-600">Successful Payments</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatPrice(
                                        payments
                                            .filter(p => p.status === 'succeeded')
                                            .reduce((sum, p) => sum + p.amount, 0)
                                    )}
                                </div>
                                <div className="text-sm text-gray-600">Total Paid</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-600">
                                    {payments.filter(p => p.status === 'failed').length}
                                </div>
                                <div className="text-sm text-gray-600">Failed Payments</div>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">
                                                {formatDate(payment.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {payment.description || 'Subscription Payment'}
                                                    </div>
                                                    {payment.stripe_payment_intent_id && (
                                                        <div className="text-xs text-gray-500">
                                                            ID: {payment.stripe_payment_intent_id.slice(-8)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {formatPrice(payment.amount)}
                                                </div>
                                                <div className="text-xs text-gray-500 uppercase">
                                                    {payment.currency}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(payment.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {payment.status === 'succeeded' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadInvoice(payment.id)}
                                                        disabled={downloadingId === payment.id}
                                                    >
                                                        {downloadingId === payment.id ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Download className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Refresh Button */}
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                onClick={fetchPaymentHistory}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}