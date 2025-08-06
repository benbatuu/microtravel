import { rateLimit } from '@/lib/rate-limit';

// CSRF Token Management
export class CSRFProtection {
    private static readonly TOKEN_HEADER = 'X-CSRF-Token';
    private static readonly TOKEN_COOKIE = 'csrf-token';
    private static readonly TOKEN_LENGTH = 32;

    static generateToken(): string {
        const array = new Uint8Array(this.TOKEN_LENGTH);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static setToken(token: string): void {
        if (typeof document !== 'undefined') {
            document.cookie = `${this.TOKEN_COOKIE}=${token}; path=/; secure; samesite=strict`;
        }
    }

    static getToken(): string | null {
        if (typeof document === 'undefined') return null;

        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie =>
            cookie.trim().startsWith(`${this.TOKEN_COOKIE}=`)
        );

        return csrfCookie ? csrfCookie.split('=')[1] : null;
    }

    static validateToken(providedToken: string, storedToken: string): boolean {
        if (!providedToken || !storedToken) return false;
        return providedToken === storedToken;
    }

    static getHeaders(): Record<string, string> {
        const token = this.getToken();
        return token ? { [this.TOKEN_HEADER]: token } : {};
    }
}

// Rate Limiting for Authentication
export const authRateLimit = {
    // Login attempts: 5 attempts per 15 minutes
    login: rateLimit({
        interval: 15 * 60 * 1000, // 15 minutes
        uniqueTokenPerInterval: 500,
        maxAttempts: 5,
    }),

    // Signup attempts: 3 attempts per hour
    signup: rateLimit({
        interval: 60 * 60 * 1000, // 1 hour
        uniqueTokenPerInterval: 500,
        maxAttempts: 3,
    }),

    // Password reset: 3 attempts per hour
    passwordReset: rateLimit({
        interval: 60 * 60 * 1000, // 1 hour
        uniqueTokenPerInterval: 500,
        maxAttempts: 3,
    }),

    // Email verification: 5 attempts per hour
    emailVerification: rateLimit({
        interval: 60 * 60 * 1000, // 1 hour
        uniqueTokenPerInterval: 500,
        maxAttempts: 5,
    }),
};

// Password Strength Validation
export class PasswordValidator {
    private static readonly MIN_LENGTH = 8;
    private static readonly MAX_LENGTH = 128;

    static validate(password: string): {
        isValid: boolean;
        errors: string[];
        strength: 'weak' | 'medium' | 'strong';
        score: number;
    } {
        const errors: string[] = [];
        let score = 0;

        // Length check
        if (password.length < this.MIN_LENGTH) {
            errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
        } else if (password.length >= this.MIN_LENGTH) {
            score += 1;
        }

        if (password.length > this.MAX_LENGTH) {
            errors.push(`Password must be no more than ${this.MAX_LENGTH} characters long`);
        }

        // Character type checks
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        } else {
            score += 1;
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        } else {
            score += 1;
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        } else {
            score += 1;
        }

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        } else {
            score += 1;
        }

        // Common password patterns
        if (/(.)\1{2,}/.test(password)) {
            errors.push('Password should not contain repeated characters');
            score -= 1;
        }

        if (/123|abc|qwe|password|admin/i.test(password)) {
            errors.push('Password should not contain common patterns');
            score -= 1;
        }

        // Determine strength
        let strength: 'weak' | 'medium' | 'strong';
        if (score < 3) {
            strength = 'weak';
        } else if (score < 5) {
            strength = 'medium';
        } else {
            strength = 'strong';
        }

        return {
            isValid: errors.length === 0,
            errors,
            strength,
            score: Math.max(0, score),
        };
    }

    static getStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
        switch (strength) {
            case 'weak':
                return 'text-red-500';
            case 'medium':
                return 'text-yellow-500';
            case 'strong':
                return 'text-green-500';
            default:
                return 'text-gray-500';
        }
    }

    static getStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
        switch (strength) {
            case 'weak':
                return 'Weak';
            case 'medium':
                return 'Medium';
            case 'strong':
                return 'Strong';
            default:
                return 'Unknown';
        }
    }
}

// Input Sanitization
export class InputSanitizer {
    static sanitizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    static sanitizeText(text: string): string {
        return text.trim().replace(/[<>]/g, '');
    }

    static sanitizeName(name: string): string {
        return name.trim().replace(/[^a-zA-Z\s'-]/g, '');
    }

    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Session Security
export class SessionSecurity {
    private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
    private static readonly REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour

    static isSessionExpired(lastActivity: number): boolean {
        return Date.now() - lastActivity > this.SESSION_TIMEOUT;
    }

    static shouldRefreshSession(lastRefresh: number): boolean {
        return Date.now() - lastRefresh > this.REFRESH_THRESHOLD;
    }

    static generateSessionId(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static setSecurityHeaders(): Record<string, string> {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        };
    }
}

// Audit Logging
export class AuditLogger {
    static async logAuthEvent(
        event: 'login' | 'logout' | 'signup' | 'password_reset' | 'failed_login',
        userId?: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        try {
            const logEntry = {
                event,
                userId,
                timestamp: new Date().toISOString(),
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                ip: metadata?.ip || 'unknown',
                metadata,
            };

            // In a real application, you would send this to your logging service
            console.log('[AUDIT]', logEntry);

            // You could also store in database or send to external service
            // await fetch('/api/audit-log', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(logEntry),
            // });
        } catch (error) {
            console.error('Failed to log audit event:', error);
        }
    }

    static async logSecurityEvent(
        event: 'suspicious_activity' | 'rate_limit_exceeded' | 'csrf_violation',
        details: Record<string, any>
    ): Promise<void> {
        try {
            const logEntry = {
                event,
                timestamp: new Date().toISOString(),
                severity: 'high',
                details,
            };

            console.warn('[SECURITY]', logEntry);

            // In production, this should trigger alerts
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }
}

// Device Fingerprinting (basic)
export class DeviceFingerprint {
    static generate(): string {
        if (typeof window === 'undefined') return 'server';

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Device fingerprint', 2, 2);
        }

        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL(),
        ].join('|');

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(16);
    }
}

// Security Headers Utility
export function getSecurityHeaders(): Record<string, string> {
    return {
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.supabase.co https://api.stripe.com",
            "frame-src https://js.stripe.com",
        ].join('; '),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
}