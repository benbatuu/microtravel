"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

const languages = [
    { code: "TR", name: "Türkçe", flag: "🇹🇷" },
    { code: "EN", name: "English", flag: "🇺🇸" },
    { code: "ES", name: "Español", flag: "🇪🇸" },
    { code: "FR", name: "Français", flag: "🇫🇷" },
];

const LanguagePicker: React.FC = () => {
    const [selected, setSelected] = useState("EN");

    useEffect(() => {
        const stored = localStorage.getItem("language");
        if (stored && languages.find(lang => lang.code === stored)) {
            setSelected(stored);
        }
    }, []);

    const handleSelect = (langCode: string) => {
        setSelected(langCode);
        localStorage.setItem("language", langCode);
    };

    return (
        <div className="w-full">
            {languages.map((language) => (
                <button
                    key={language.code}
                    onClick={() => handleSelect(language.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${selected === language.code
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                    </div>
                    {selected === language.code && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default LanguagePicker;