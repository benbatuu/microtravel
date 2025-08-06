interface RateLimitConfig {
    interval: number; // Time window in milliseconds
    uniqueTokenPerInterval: number; // Max unique tokens to track
    maxAttempts: number; // Max attempts per interval
}

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

class RateLimiter {
    private cache = new Map<string, { count: number; resetTime: number }>();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
    }

    async check(identifier: string): Promise<RateLimitResult> {
        const now = Date.now();
        const key = identifier;

        // Clean up expired entries
        this.cleanup(now);

        const entry = this.cache.get(key);
        const resetTime = now + this.config.interval;

        if (!entry || now > entry.resetTime) {
            // First request or expired window
            this.cache.set(key, { count: 1, resetTime });
            return {
                success: true,
                limit: this.config.maxAttempts,
                remaining: this.config.maxAttempts - 1,
                reset: resetTime,
            };
        }

        if (entry.count >= this.config.maxAttempts) {
            // Rate limit exceeded
            return {
                success: false,
                limit: this.config.maxAttempts,
                remaining: 0,
                reset: entry.resetTime,
            };
        }

        // Increment counter
        entry.count++;
        this.cache.set(key, entry);

        return {
            success: true,
            limit: this.config.maxAttempts,
            remaining: this.config.maxAttempts - entry.count,
            reset: entry.resetTime,
        };
    }

    private cleanup(now: number): void {
        // Remove expired entries to prevent memory leaks
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.resetTime) {
                this.cache.delete(key);
            }
        }

        // If cache is too large, remove oldest entries
        if (this.cache.size > this.config.uniqueTokenPerInterval) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => a[1].resetTime - b[1].resetTime);

            const toRemove = entries.slice(0, entries.length - this.config.uniqueTokenPerInterval);
            toRemove.forEach(([key]) => this.cache.delete(key));
        }
    }

    reset(identifier: string): void {
        this.cache.delete(identifier);
    }

    getStatus(identifier: string): RateLimitResult | null {
        const entry = this.cache.get(identifier);
        if (!entry) return null;

        const now = Date.now();
        if (now > entry.resetTime) return null;

        return {
            success: entry.count < this.config.maxAttempts,
            limit: this.config.maxAttempts,
            remaining: Math.max(0, this.config.maxAttempts - entry.count),
            reset: entry.resetTime,
        };
    }
}

// Factory function to create rate limiters
export function rateLimit(config: RateLimitConfig) {
    const limiter = new RateLimiter(config);

    return {
        check: (identifier: string) => limiter.check(identifier),
        reset: (identifier: string) => limiter.reset(identifier),
        getStatus: (identifier: string) => limiter.getStatus(identifier),
    };
}

// Utility function to get client identifier
export function getClientIdentifier(request?: Request): string {
    if (typeof window !== 'undefined') {
        // Client-side: use a combination of factors
        return [
            navigator.userAgent,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
        ].join('|');
    }

    if (request) {
        // Server-side: use IP and user agent
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        return `${ip}|${userAgent}`;
    }

    return 'unknown';
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
    // Authentication attempts
    auth: rateLimit({
        interval: 15 * 60 * 1000, // 15 minutes
        uniqueTokenPerInterval: 500,
        maxAttempts: 5,
    }),

    // API requests
    api: rateLimit({
        interval: 60 * 1000, // 1 minute
        uniqueTokenPerInterval: 1000,
        maxAttempts: 100,
    }),

    // Password reset requests
    passwordReset: rateLimit({
        interval: 60 * 60 * 1000, // 1 hour
        uniqueTokenPerInterval: 500,
        maxAttempts: 3,
    }),

    // Email verification requests
    emailVerification: rateLimit({
        interval: 60 * 60 * 1000, // 1 hour
        uniqueTokenPerInterval: 500,
        maxAttempts: 5,
    }),

    // Contact form submissions
    contactForm: rateLimit({
        interval: 60 * 60 * 1000, // 1 hour
        uniqueTokenPerInterval: 500,
        maxAttempts: 3,
    }),
};