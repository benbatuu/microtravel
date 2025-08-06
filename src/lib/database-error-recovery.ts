import { createClient } from '@supabase/supabase-js';

export interface DatabaseRetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    retryableErrors?: string[];
}

export class DatabaseErrorRecovery {
    private static readonly DEFAULT_RETRYABLE_ERRORS = [
        'PGRST301', // Connection timeout
        'PGRST302', // Connection failed
        'PGRST116', // Row level security violation (might be temporary)
        '08000',    // Connection exception
        '08003',    // Connection does not exist
        '08006',    // Connection failure
        '53300',    // Too many connections
        '57P01',    // Admin shutdown
        '57P02',    // Crash shutdown
        '57P03',    // Cannot connect now
    ];

    private static readonly DEFAULT_OPTIONS: Required<DatabaseRetryOptions> = {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        retryableErrors: DatabaseErrorRecovery.DEFAULT_RETRYABLE_ERRORS
    };

    static isRetryableError(error: any, retryableErrors: string[]): boolean {
        if (!error) return false;

        const errorCode = error.code || error.error_code || error.status;
        const errorMessage = error.message || '';

        // Check specific error codes
        if (errorCode && retryableErrors.includes(errorCode.toString())) {
            return true;
        }

        // Check for connection-related errors in message
        const connectionErrors = [
            'connection',
            'timeout',
            'network',
            'unavailable',
            'temporary',
            'retry'
        ];

        return connectionErrors.some(keyword =>
            errorMessage.toLowerCase().includes(keyword)
        );
    }

    static async withRetry<T>(
        operation: () => Promise<T>,
        options: DatabaseRetryOptions = {}
    ): Promise<T> {
        const opts = { ...DatabaseErrorRecovery.DEFAULT_OPTIONS, ...options };
        let lastError: any;
        let delay = opts.baseDelay;

        for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                // Don't retry if this is the last attempt
                if (attempt === opts.maxRetries) {
                    break;
                }

                // Don't retry if error is not retryable
                if (!DatabaseErrorRecovery.isRetryableError(error, opts.retryableErrors)) {
                    break;
                }

                // Log retry attempt
                console.warn(`Database operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${opts.maxRetries + 1}):`, {
                    error: error.message,
                    code: error.code,
                    attempt: attempt + 1
                });

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delay));

                // Increase delay for next attempt
                delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
            }
        }

        throw lastError;
    }

    static async withConnectionRecovery<T>(
        supabaseClient: any,
        operation: (client: any) => Promise<T>,
        options: DatabaseRetryOptions = {}
    ): Promise<T> {
        return DatabaseErrorRecovery.withRetry(async () => {
            try {
                return await operation(supabaseClient);
            } catch (error) {
                // If it's a connection error, try to recreate the client
                if (DatabaseErrorRecovery.isRetryableError(error, options.retryableErrors || DatabaseErrorRecovery.DEFAULT_RETRYABLE_ERRORS)) {
                    console.warn('Database connection error detected, attempting recovery:', error.message);

                    // For server-side operations, we might need to recreate the client
                    // This is more relevant for long-running processes
                    const newClient = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );

                    return await operation(newClient);
                }

                throw error;
            }
        }, options);
    }

    static async executeWithRecovery<T>(
        client: any,
        query: string,
        params?: any[],
        options: DatabaseRetryOptions = {}
    ): Promise<T> {
        return DatabaseErrorRecovery.withRetry(async () => {
            const { data, error } = await client.rpc(query, params);

            if (error) {
                throw error;
            }

            return data;
        }, options);
    }

    static async queryWithRecovery<T>(
        client: any,
        tableName: string,
        queryBuilder: (query: any) => any,
        options: DatabaseRetryOptions = {}
    ): Promise<T> {
        return DatabaseErrorRecovery.withRetry(async () => {
            const query = client.from(tableName);
            const builtQuery = queryBuilder(query);
            const { data, error } = await builtQuery;

            if (error) {
                throw error;
            }

            return data;
        }, options);
    }

    static async insertWithRecovery<T>(
        client: any,
        tableName: string,
        data: any,
        options: DatabaseRetryOptions = {}
    ): Promise<T> {
        return DatabaseErrorRecovery.withRetry(async () => {
            const { data: result, error } = await client
                .from(tableName)
                .insert(data)
                .select();

            if (error) {
                throw error;
            }

            return result;
        }, options);
    }

    static async updateWithRecovery<T>(
        client: any,
        tableName: string,
        data: any,
        condition: any,
        options: DatabaseRetryOptions = {}
    ): Promise<T> {
        return DatabaseErrorRecovery.withRetry(async () => {
            let query = client.from(tableName).update(data);

            // Apply conditions
            Object.entries(condition).forEach(([key, value]) => {
                query = query.eq(key, value);
            });

            const { data: result, error } = await query.select();

            if (error) {
                throw error;
            }

            return result;
        }, options);
    }

    static async deleteWithRecovery<T>(
        client: any,
        tableName: string,
        condition: any,
        options: DatabaseRetryOptions = {}
    ): Promise<T> {
        return DatabaseErrorRecovery.withRetry(async () => {
            let query = client.from(tableName).delete();

            // Apply conditions
            Object.entries(condition).forEach(([key, value]) => {
                query = query.eq(key, value);
            });

            const { data: result, error } = await query.select();

            if (error) {
                throw error;
            }

            return result;
        }, options);
    }

    // Health check utility
    static async checkDatabaseHealth(client: any): Promise<{
        healthy: boolean;
        latency: number;
        error?: any;
    }> {
        const startTime = Date.now();

        try {
            await client.from('profiles').select('id').limit(1);
            const latency = Date.now() - startTime;

            return {
                healthy: true,
                latency
            };
        } catch (error) {
            const latency = Date.now() - startTime;

            return {
                healthy: false,
                latency,
                error
            };
        }
    }
}