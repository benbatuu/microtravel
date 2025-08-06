'use client';

import { useState, useCallback, useEffect } from 'react';

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
    email?: boolean;
    password?: boolean;
    confirmPassword?: string; // field name to match
}

export interface ValidationRules {
    [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
    [fieldName: string]: string;
}

export interface FormState {
    [fieldName: string]: any;
}

export interface UseFormValidationReturn {
    values: FormState;
    errors: ValidationErrors;
    touched: { [fieldName: string]: boolean };
    isValid: boolean;
    isSubmitting: boolean;
    setValue: (name: string, value: any) => void;
    setError: (name: string, error: string) => void;
    clearError: (name: string) => void;
    validateField: (name: string, value?: any) => string | null;
    validateForm: () => boolean;
    handleSubmit: (onSubmit: (values: FormState) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
    reset: (initialValues?: FormState) => void;
    setSubmitting: (submitting: boolean) => void;
}

export const useFormValidation = (
    initialValues: FormState = {},
    validationRules: ValidationRules = {}
): UseFormValidationReturn => {
    const [values, setValues] = useState<FormState>(initialValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ [fieldName: string]: boolean }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = useCallback((name: string, value?: any): string | null => {
        const fieldValue = value !== undefined ? value : values[name];
        const rules = validationRules[name];

        if (!rules) return null;

        // Required validation
        if (rules.required && (!fieldValue || fieldValue.toString().trim() === '')) {
            return 'This field is required';
        }

        // Skip other validations if field is empty and not required
        if (!fieldValue || fieldValue.toString().trim() === '') {
            return null;
        }

        // Email validation
        if (rules.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
                return 'Please enter a valid email address';
            }
        }

        // Password validation
        if (rules.password) {
            if (fieldValue.length < 6) {
                return 'Password must be at least 6 characters long';
            }
            if (!/(?=.*[a-z])/.test(fieldValue)) {
                return 'Password must contain at least one lowercase letter';
            }
            if (!/(?=.*[A-Z])/.test(fieldValue)) {
                return 'Password must contain at least one uppercase letter';
            }
            if (!/(?=.*\d)/.test(fieldValue)) {
                return 'Password must contain at least one number';
            }
        }

        // Confirm password validation
        if (rules.confirmPassword) {
            const passwordValue = values[rules.confirmPassword];
            if (fieldValue !== passwordValue) {
                return 'Passwords do not match';
            }
        }

        // Min length validation
        if (rules.minLength && fieldValue.length < rules.minLength) {
            return `Must be at least ${rules.minLength} characters long`;
        }

        // Max length validation
        if (rules.maxLength && fieldValue.length > rules.maxLength) {
            return `Must be no more than ${rules.maxLength} characters long`;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(fieldValue)) {
            return 'Invalid format';
        }

        // Custom validation
        if (rules.custom) {
            const customError = rules.custom(fieldValue);
            if (customError) {
                return customError;
            }
        }

        return null;
    }, [values, validationRules]);

    const setValue = useCallback((name: string, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));

        // Real-time validation
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error || ''
        }));
    }, [validateField]);

    const setError = useCallback((name: string, error: string) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    const clearError = useCallback((name: string) => {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }, []);

    const validateForm = useCallback((): boolean => {
        const newErrors: ValidationErrors = {};
        let isFormValid = true;

        Object.keys(validationRules).forEach(fieldName => {
            const error = validateField(fieldName);
            if (error) {
                newErrors[fieldName] = error;
                isFormValid = false;
            }
        });

        setErrors(newErrors);
        return isFormValid;
    }, [validationRules, validateField]);

    const handleSubmit = useCallback((
        onSubmit: (values: FormState) => Promise<void> | void
    ) => {
        return async (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault();
            }

            setIsSubmitting(true);

            try {
                // Mark all fields as touched
                const allTouched: { [key: string]: boolean } = {};
                Object.keys(validationRules).forEach(key => {
                    allTouched[key] = true;
                });
                setTouched(allTouched);

                // Validate form
                if (!validateForm()) {
                    return;
                }

                await onSubmit(values);
            } catch (error) {
                console.error('Form submission error:', error);
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        };
    }, [values, validateForm, validationRules]);

    const reset = useCallback((newInitialValues?: FormState) => {
        const resetValues = newInitialValues || initialValues;
        setValues(resetValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    const setSubmitting = useCallback((submitting: boolean) => {
        setIsSubmitting(submitting);
    }, []);

    // Calculate if form is valid
    const isValid = Object.keys(validationRules).every(fieldName => {
        const error = errors[fieldName];
        return !error || error === '';
    });

    return {
        values,
        errors,
        touched,
        isValid,
        isSubmitting,
        setValue,
        setError,
        clearError,
        validateField,
        validateForm,
        handleSubmit,
        reset,
        setSubmitting
    };
};