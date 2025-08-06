'use client'

import { UnauthorizedPage } from '@/components/auth/UnauthorizedPage'
import { useSearchParams } from 'next/navigation'

export default function UnauthorizedPageRoute() {
    const searchParams = useSearchParams()
    const reason = searchParams.get('reason') as any

    return (
        <UnauthorizedPage
            reason={reason || 'authentication_required'}
        />
    )
}