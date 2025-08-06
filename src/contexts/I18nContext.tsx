"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, locales } from '@/i18n/config';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    isLoading: boolean;
    messages: Record<string, any>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
    initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale = defaultLocale }: I18nProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);
    const [messages, setMessages] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load messages for the current locale
    useEffect(() => {
        const loadMessages = async () => {
            setIsLoading(true);
            try {
                const messagesModule = await import(`@/i18n/messages/${locale}.json`);
                setMessages(messagesModule.default);
            } catch (error) {
                console.error(`Failed to load messages for locale ${locale}:`, error);
                // Fallback to default locale
                if (locale !== defaultLocale) {
                    const fallbackModule = await import(`@/i18n/messages/${defaultLocale}.json`);
                    setMessages(fallbackModule.default);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();
    }, [locale]);

    // Load initial locale from localStorage or browser
    useEffect(() => {
        const savedLocale = localStorage.getItem('locale') as Locale;
        if (savedLocale && locales.includes(savedLocale)) {
            setLocaleState(savedLocale);
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0] as Locale;
            if (locales.includes(browserLang)) {
                setLocaleState(browserLang);
            }
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
        // Update document language
        document.documentElement.lang = newLocale;
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: any = messages;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        if (typeof value !== 'string') {
            console.warn(`Translation value is not a string: ${key}`);
            return key;
        }

        // Replace parameters
        if (params) {
            return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
                return params[paramKey]?.toString() || match;
            });
        }

        return value;
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, isLoading, messages }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

export function useTranslation() {
    const { t } = useI18n();
    return { t };
}