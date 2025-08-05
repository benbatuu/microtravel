// Analytics utility for conversion tracking
export interface AnalyticsEvent {
    event: string;
    category?: string;
    label?: string;
    value?: number;
    custom_parameters?: Record<string, unknown>;
}

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        fbq?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}

export class Analytics {
    private static isInitialized = false;

    static initialize() {
        if (typeof window === 'undefined' || this.isInitialized) return;

        // Initialize dataLayer for Google Analytics
        window.dataLayer = window.dataLayer || [];
        this.isInitialized = true;
    }

    static track(event: AnalyticsEvent) {
        if (typeof window === 'undefined') return;

        // Google Analytics 4
        if (window.gtag) {
            window.gtag('event', event.event, {
                event_category: event.category,
                event_label: event.label,
                value: event.value,
                ...event.custom_parameters
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            window.fbq('track', event.event, event.custom_parameters);
        }

        // Console log for development
        if (process.env.NODE_ENV === 'development') {
            console.log('Analytics Event:', event);
        }
    }

    // Predefined conversion events
    static trackNewsletterSignup(source: string = 'landing_page') {
        this.track({
            event: 'newsletter_signup',
            category: 'engagement',
            label: source,
            custom_parameters: {
                source,
                timestamp: new Date().toISOString()
            }
        });
    }

    static trackCTAClick(cta_name: string, location: string) {
        this.track({
            event: 'cta_click',
            category: 'engagement',
            label: cta_name,
            custom_parameters: {
                cta_name,
                location,
                timestamp: new Date().toISOString()
            }
        });
    }

    static trackSearch(query: string, source: string = 'hero_search') {
        this.track({
            event: 'search',
            category: 'engagement',
            label: query,
            custom_parameters: {
                search_term: query,
                source,
                timestamp: new Date().toISOString()
            }
        });
    }

    static trackPricingView(plan: string) {
        this.track({
            event: 'pricing_view',
            category: 'conversion',
            label: plan,
            custom_parameters: {
                plan,
                timestamp: new Date().toISOString()
            }
        });
    }

    static trackFAQInteraction(question: string) {
        this.track({
            event: 'faq_interaction',
            category: 'engagement',
            label: question,
            custom_parameters: {
                question,
                timestamp: new Date().toISOString()
            }
        });
    }
}