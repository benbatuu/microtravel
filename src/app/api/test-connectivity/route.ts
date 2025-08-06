import { NextRequest, NextResponse } from 'next/server'
import { testAllConnections, validateEnvironmentVariables } from '@/lib/api-test'

export async function GET(request: NextRequest) {
    try {
        // First validate environment variables
        const envValidation = validateEnvironmentVariables()

        if (envValidation.status === 'error') {
            return NextResponse.json({
                success: false,
                error: 'Environment configuration error',
                details: envValidation
            }, { status: 500 })
        }

        // Test all API connections
        const connectionTests = await testAllConnections()

        const hasErrors = connectionTests.some(test => test.status === 'error')

        return NextResponse.json({
            success: !hasErrors,
            environment: envValidation,
            connections: connectionTests,
            timestamp: new Date().toISOString()
        }, {
            status: hasErrors ? 500 : 200
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: 'Failed to test API connectivity',
            details: error.message
        }, { status: 500 })
    }
}