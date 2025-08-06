"use client";

import React from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

const LanguagePicker: React.FC = () => {
    const { locale, setLocale } = useI18n();

    const handleLanguageChange = (newLocale: Locale) => {
        setLocale(newLocale);
    };

    return (
        <div className="w-full">
            {locales.map((lang) => (
                <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${locale === lang
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">{localeFlags[lang]}</span>
                        <span className="font-medium">{localeNames[lang]}</span>
                    </div>
                    {locale === lang && (
                        <Check className="w-4 h-4 text-primary" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default LanguagePicker;