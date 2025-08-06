import { Locale, defaultLocale, locales } from '@/i18n/config';

export function detectBrowserLanguage(): Locale {
    if (typeof window === 'undefined') {
        return defaultLocale;
    }

    // Check for saved preference first
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
        return savedLocale;
    }

    // Detect from browser
    const browserLanguages = navigator.languages || [navigator.language];

    for (const lang of browserLanguages) {
        const locale = lang.split('-')[0] as Locale;
        if (locales.includes(locale)) {
            return locale;
        }
    }

    return defaultLocale;
}

export function getLocalizedPath(path: string, locale: Locale): string {
    // Remove existing locale from path if present
    const cleanPath = path.replace(/^\/[a-z]{2}(\/|$)/, '/');

    // Don't add locale prefix for default locale
    if (locale === defaultLocale) {
        return cleanPath === '/' ? '/' : cleanPath;
    }

    return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

export function removeLocaleFromPath(path: string): string {
    return path.replace(/^\/[a-z]{2}(\/|$)/, '/');
}

export function getLocaleFromPath(path: string): Locale {
    const segments = path.split('/');
    const potentialLocale = segments[1];

    if (locales.includes(potentialLocale as Locale)) {
        return potentialLocale as Locale;
    }

    return defaultLocale;
}