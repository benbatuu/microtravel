import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export interface WebhookRetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    retryableEvents?: string[];
}

export interface WebhookProcessingResult {
    success: boolean;
    error?: any;
    shouldRetry: boolean;
    retryAfter?: number;
}

export class WebhookErrorHandler {
    private static readonly DEFAULT_RETRYABLE_EVENTS = [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed'
    ];

    private static readonly DEFAULT_OPTIONS: Required<WebhookRetryOptions> = {
        maxRetries: 3,
        baseDelay: 2000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableEvents: WebhookErrorHandler.DEFAULT_RETRYABLE_EVENTS
    };

    static isRetryableEvent(eventType: string, retryableEvents: string[]): boolean {
        return retryableEvents.includes(eventType);
    }

    static isRetryableError(error: any): boolean {
        // Network errors are retryable
        if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
            return true;
        }

        // Database connection errors are retryable
        if (error?.message?.includes('connection') || error?.message?.includes('timeout')) {
            return true;
        }

        // Temporary server errors are retryable
        if (error?.status >= 500 && error?.status < 600) {
            return true;
        }

        // Rate limiting is retryable
        if (error?.status === 429) {
            return true;
        }

        // Don't retry client errors (4xx except 429)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
            return false;
        }

        return true;
    }

    static calculateRetryDelay(attempt: number, options: WebhookRetryOptions = {}): number {
        const opts = { ...WebhookErrorHandler.DEFAULT_OPTIONS, ...options };
        const delay = opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt);
        return Math.min(delay, opts.maxDelay);
    }

    static async processWebhookWithRetry(
        event: Stripe.Event,
        processor: (event: Stripe.Event) => Promise<void>,
        options: WebhookRetryOptions = {}
    ): Promise<WebhookProcessingResult> {
        const opts = { ...WebhookErrorHandler.DEFAULT_OPTIONS, ...options };
        let lastError: any;

        // Check if event type is retryable
        const isRetryableEventType = WebhookErrorHandler.isRetryableEvent(
            event.type,
            opts.retryableEvents
        );

        for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
            try {
                await processor(event);

                // Log successful processing
                console.log(`Webhook processed successfully: ${event.type} (${event.id})`);

                return {
                    success: true,
                    shouldRetry: false
                };
            } catch (error) {
                lastError = error;

                // Log the error
                console.error(`Webhook processing failed (attempt ${attempt + 1}/${opts.maxRetries + 1}):`, {
                    eventType: event.type,
                    eventId: event.id,
                    error: error.message,
                    attempt: attempt + 1
                });

                // Don't retry if this is the last attempt
                if (attempt === opts.maxRetries) {
                    break;
                }

                // Don't retry if event type is not retryable
                if (!isRetryableEventType) {
                    console.warn(`Event type ${event.type} is not configured for retry`);
                    break;
                }

                // Don't retry if error is not retryable
                if (!WebhookErrorHandler.isRetryableError(error)) {
                    console.warn(`Error is not retryable: ${error.message}`);
                    break;
                }

                // Calculate delay and wait
                const delay = WebhookErrorHandler.calculateRetryDelay(attempt, opts);
                console.log(`Retrying webhook processing in ${delay}ms...`);

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        // Determine if we should suggest retry to Stripe
        const shouldRetry = isRetryableEventType &&
            WebhookErrorHandler.isRetryableError(lastError);

        return {
            success: false,
            error: lastError,
            shouldRetry,
            retryAfter: shouldRetry ? WebhookErrorHandler.calculateRetryDelay(0, opts) / 1000 : undefined
        };
    }

    static createWebhookResponse(result: WebhookProcessingResult): NextResponse {
        if (result.success) {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // If we should retry, return 500 with retry-after header
        if (result.shouldRetry && result.retryAfter) {
            return NextResponse.json(
                {
                    error: 'Temporary processing error',
                    message: 'Webhook will be retried'
                },
                {
                    status: 500,
                    headers: {
                        'Retry-After': result.retryAfter.toString()
                    }
                }
            );
        }

        // If we shouldn't retry, return 400 to prevent further retries
        return NextResponse.json(
            {
                error: 'Webhook processing failed',
                message: result.error?.message || 'Processing failed permanently'
            },
            { status: 400 }
        );
    }

    static async verifyWebhookSignature(
        request: NextRequest,
        webhookSecret: string
    ): Promise<{ valid: boolean; event?: Stripe.Event; error?: string }> {
        try {
            const body = await request.text();
            const signature = request.headers.get('stripe-signature');

            if (!signature) {
                return {
                    valid: false,
                    error: 'Missing stripe-signature header'
                };
            }

            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
            const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

            return {
                valid: true,
                event
            };
        } catch (error: any) {
            console.error('Webhook signature verification failed:', error.message);

            return {
                valid: false,
                error: error.message
            };
        }
    }

    // Webhook handler wrapper
    static withWebhookErrorHandling(
        processor: (event: Stripe.Event) => Promise<void>,
        options: WebhookRetryOptions = {}
    ) {
        return async (request: NextRequest): Promise<NextResponse> => {
            try {
                // Verify webhook signature
                const verification = await WebhookErrorHandler.verifyWebhookSignature(
                    request,
                    process.env.STRIPE_WEBHOOK_SECRET!
                );

                if (!verification.valid) {
                    console.error('Webhook signature verification failed:', verification.error);
                    return NextResponse.json(
                        { error: 'Invalid signature' },
                        { status: 400 }
                    );
                }

                const event = verification.event!;

                // Log webhook received
                console.log(`Webhook received: ${event.type} (${event.id})`);

                // Process webhook with retry logic
                const result = await WebhookErrorHandler.processWebhookWithRetry(
                    event,
                    processor,
                    options
                );

                return WebhookErrorHandler.createWebhookResponse(result);
            } catch (error) {
                console.error('Webhook handler error:', error);

                return NextResponse.json(
                    { error: 'Internal server error' },
                    { status: 500 }
                );
            }
        };
    }

    // Dead letter queue for failed webhooks (optional implementation)
    static async logFailedWebhook(
        event: Stripe.Event,
        error: any,
        attempts: number
    ): Promise<void> {
        const failedWebhook = {
            event_id: event.id,
            event_type: event.type,
            error_message: error.message,
            error_stack: error.stack,
            attempts,
            created_at: new Date().toISOString(),
            event_data: event.data
        };

        // In a real implementation, you might want to store this in a database
        // or send to a monitoring service
        console.error('Failed webhook logged:', failedWebhook);

        // You could also implement alerting here
        if (attempts >= 3) {
            console.error(`CRITICAL: Webhook ${event.id} failed after ${attempts} attempts`);
            // Send alert to monitoring service
        }
    }
}