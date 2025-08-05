'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import Link from 'next/link'

interface SignupFormProps {
    onSuccess?: () => void
}

interface PasswordRequirement {
    label: string
    test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'Contains number', test: (p) => /\d/.test(p) },
]

export function SignupForm({ onSuccess }: SignupFormProps) {
    const { signUp } = useAuth()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        // Full name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required'
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters'
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else {
            const failedRequirements = passwordRequirements.filter(req => !req.test(formData.password))
            if (failedRequirements.length > 0) {
                newErrors.password = 'Password does not meet requirements'
            }
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        // Terms agreement validation
        if (!agreedToTerms) {
            newErrors.terms = 'You must agree to the terms and conditions'
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
            const { error } = await signUp(
                formData.email,
                formData.password,
                formData.fullName.trim()
            )

            if (error) {
                setErrors({ submit: error.message })
            } else {
                setEmailSent(true)
                onSuccess?.()
            }
        } catch {
            setErrors({ submit: 'An unexpected error occurred. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const getPasswordStrength = () => {
        const passedRequirements = passwordRequirements.filter(req => req.test(formData.password))
        return passedRequirements.length
    }

    const getPasswordStrengthColor = () => {
        const strength = getPasswordStrength()
        if (strength <= 1) return 'bg-red-500'
        if (strength <= 2) return 'bg-yellow-500'
        if (strength <= 3) return 'bg-blue-500'
        return 'bg-green-500'
    }

    if (emailSent) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
                    <CardDescription className="text-center">
                        We&apos;ve sent a verification link to {formData.email}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            Please check your email and click the verification link to complete your registration.
                            You can close this window once you&apos;ve clicked the link.
                        </AlertDescription>
                    </Alert>
                </CardContent>

                <CardFooter>
                    <div className="text-center text-sm w-full">
                        Didn&apos;t receive the email?{' '}
                        <button
                            onClick={() => setEmailSent(false)}
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Try again
                        </button>
                    </div>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
                <CardDescription className="text-center">
                    Join thousands of travelers sharing their experiences
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
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={errors.fullName ? 'border-red-500' : ''}
                            disabled={isLoading}
                            autoComplete="name"
                        />
                        {errors.fullName && (
                            <p className="text-sm text-red-500">{errors.fullName}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={errors.email ? 'border-red-500' : ''}
                            disabled={isLoading}
                            autoComplete="email"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>

                        {formData.password && (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                            style={{ width: `${(getPasswordStrength() / 4) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {getPasswordStrength()}/4
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    {passwordRequirements.map((req, index) => (
                                        <div key={index} className="flex items-center space-x-2 text-xs">
                                            {req.test(formData.password) ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <X className="h-3 w-3 text-gray-400" />
                                            )}
                                            <span className={req.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                                disabled={isLoading}
                            />
                            <Label htmlFor="terms" className="text-sm leading-5">
                                I agree to the{' '}
                                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                        {errors.terms && (
                            <p className="text-sm text-red-500">{errors.terms}</p>
                        )}
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
                                Creating account...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </Button>

                    <div className="text-center text-sm">
                        Already have an account?{' '}
                        <Link
                            href="/auth/login"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}