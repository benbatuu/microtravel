'use client';

import { Languages, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Language {
    code: string;
    name: string;
    flag: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export function LanguageSelector() {
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

    const handleLanguageChange = (languageCode: string) => {
        setSelectedLanguage(languageCode);
        // Here you would typically integrate with your i18n library
        console.log('Language changed to:', languageCode);
    };

    const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Languages className="h-5 w-5" />
                    <span className="sr-only">Select language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className="cursor-pointer flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{language.flag}</span>
                            <span>{language.name}</span>
                        </div>
                        {selectedLanguage === language.code && (
                            <Check className="h-4 w-4" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}