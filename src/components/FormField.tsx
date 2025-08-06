'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormFieldProps {
    name: string;
    label: string;
    type?: 'text' | 'email' | 'password' | 'textarea' | 'number';
    placeholder?: string;
    value: any;
    error?: string;
    touched?: boolean;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    onChange: (name: string, value: any) => void;
    onBlur?: (name: string) => void;
    showValidation?: boolean;
    helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    name,
    label,
    type = 'text',
    placeholder,
    value,
    error,
    touched,
    required,
    disabled,
    className,
    onChange,
    onBlur,
    showValidation = true,
    helpText
}) => {
    const hasError = touched && error;
    const isValid = touched && !error && value;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
        onChange(name, newValue);
    };

    const handleBlur = () => {
        if (onBlur) {
            onBlur(name);
        }
    };

    const inputProps = {
        id: name,
        name,
        value: value || '',
        placeholder,
        disabled,
        onChange: handleChange,
        onBlur: handleBlur,
        className: cn(
            'transition-colors',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            isValid && showValidation && 'border-green-500 focus:border-green-500 focus:ring-green-500'
        )
    };

    return (
        <div className={cn('space-y-2', className)}>
            <Label
                htmlFor={name}
                className={cn(
                    'text-sm font-medium',
                    hasError && 'text-red-600',
                    isValid && showValidation && 'text-green-600'
                )}
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div className="relative">
                {type === 'textarea' ? (
                    <Textarea {...inputProps} />
                ) : (
                    <Input {...inputProps} type={type} />
                )}

                {showValidation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {hasError && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {isValid && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                    </div>
                )}
            </div>

            {hasError && (
                <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {error}
                </p>
            )}

            {helpText && !hasError && (
                <p className="text-sm text-muted-foreground">
                    {helpText}
                </p>
            )}
        </div>
    );
};