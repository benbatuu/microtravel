'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

interface PasswordResetProps {
    onSuccess?: () => void
}

export function PasswordReset({ onSuccess }: PasswordResetProps) {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!email) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        try {
            const { error } = await resetPassword(email)

            if (error) {
                setErrors({ submit: error.message })
            } else {
                setEmailSent(true)
                onSuccess?.()
            }
        } catch  {
            setErrors({ submit: 'An unexpected error occurred. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (value: string) => {
        setEmail(value)
        // Clear field error when user starts typing
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }))
        }
    }

    if (emailSent) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
                    <CardDescription className="text-center">
                        We&apos;ve sent a password reset link to {email}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            Please check your email and click the reset link to create a new password.
                            The link will expire in 1 hour for security reasons.
                        </AlertDescription>
                    </Alert>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Didn&apos;t receive the email? Check your spam folder or
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEmailSent(false)
                                setEmail('')
                            }}
                            className="w-full"
                        >
                            Try again
                        </Button>
                    </div>
                </CardContent>

                <CardFooter>
                    <div className="text-center w-full">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Reset password</CardTitle>
                <CardDescription className="text-center">
                    Enter your email address and we&apos;ll send you a link to reset your password
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {errors.submit && (
                        <Alert variant="destructive">
                            <AlertDescription>{errors.submit}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => handleInputChange(e.target.value)}
                            className={errors.email ? 'border-red-500' : ''}
                            disabled={isLoading}
                            autoComplete="email"
                            autoFocus
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">What happens next?</p>
                        <ul className="space-y-1 text-xs">
                            <li>• We&apos;ll send a secure reset link to your email</li>
                            <li>• Click the link to create a new password</li>
                            <li>• The link expires in 1 hour for security</li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending reset link...
                            </>
                        ) : (
                            'Send reset link'
                        )}
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}