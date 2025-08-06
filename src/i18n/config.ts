export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
    en: 'English',
    tr: 'Türkçe',
};

export const localeFlags: Record<Locale, string> = {
    en: '🇺🇸',
    tr: '🇹🇷',
};

export function getLocaleFromPathname(pathname: string): Locale {
    const segments = pathname.split('/');
    const potentialLocale = segments[1];

    if (locales.includes(potentialLocale as Locale)) {
        return potentialLocale as Locale;
    }

    return defaultLocale;
}

export function removeLocaleFromPathname(pathname: string): string {
    const segments = pathname.split('/');
    const potentialLocale = segments[1];

    if (locales.includes(potentialLocale as Locale)) {
        return '/' + segments.slice(2).join('/');
    }

    return pathname;
}