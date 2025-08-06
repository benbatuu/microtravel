/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
    try {
        // Test basic dashboard data access
        const tests = []

        // Test 1: Check if we can access subscription tiers
        try {
            const { data: tiers, error: tiersError } = await supabase
                .from('subscription_tiers')
                .select('id, name, price_monthly')
                .limit(5)

            tests.push({
                test: 'Subscription Tiers Access',
                status: tiersError ? 'error' : 'success',
                message: tiersError ? tiersError.message : `Found ${tiers?.length || 0} subscription tiers`,
                data: tiers?.map(t => ({ id: t.id, name: t.name }))
            })
        } catch (error: any) {
            tests.push({
                test: 'Subscription Tiers Access',
                status: 'error',
                message: error.message
            })
        }

        // Test 2: Check if we can access profiles table structure
        try {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id')
                .limit(1)

            tests.push({
                test: 'Profiles Table Access',
                status: profilesError ? 'error' : 'success',
                message: profilesError ? profilesError.message : 'Profiles table accessible'
            })
        } catch (error: any) {
            tests.push({
                test: 'Profiles Table Access',
                status: 'error',
                message: error.message
            })
        }

        // Test 3: Check authentication status
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        tests.push({
            test: 'Authentication Check',
            status: authError ? 'error' : (user ? 'authenticated' : 'anonymous'),
            message: authError ? authError.message : (user ? `User: ${user.email}` : 'No authenticated user')
        })

        const hasErrors = tests.some(test => test.status === 'error')

        return NextResponse.json({
            success: !hasErrors,
            message: hasErrors ? 'Some dashboard tests failed' : 'Dashboard access tests passed',
            tests,
            timestamp: new Date().toISOString()
        }, {
            status: hasErrors ? 500 : 200
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: 'Dashboard test failed',
            details: error.message
        }, { status: 500 })
    }
}