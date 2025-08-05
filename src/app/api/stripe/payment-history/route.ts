import { NextRequest, NextResponse } from 'next/server'
import { getPaymentHistory } from '@/lib/payment'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing user ID' },
                { status: 400 }
            )
        }

        const result = await getPaymentHistory(userId)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error?.userMessage || 'Failed to fetch payment history' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            payments: result.data
        })
    } catch (error) {
        console.error('Payment history API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}