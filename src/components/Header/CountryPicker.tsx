"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

const countries = [
    { code: "TR", name: "Türkiye", flag: "🇹🇷" },
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "DE", name: "Deutschland", flag: "🇩🇪" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "ES", name: "España", flag: "🇪🇸" },
];

const CountryPicker: React.FC = () => {
    const [selected, setSelected] = useState("US");

    useEffect(() => {
        const stored = localStorage.getItem("country");
        if (stored && countries.find(country => country.code === stored)) {
            setSelected(stored);
        }
    }, []);

    const handleSelect = (countryCode: string) => {
        setSelected(countryCode);
        localStorage.setItem("country", countryCode);
    };

    return (
        <div className="w-full">
            {countries.map((country) => (
                <button
                    key={country.code}
                    onClick={() => handleSelect(country.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${selected === country.code
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">{country.flag}</span>
                        <span className="font-medium">{country.name}</span>
                    </div>
                    {selected === country.code && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default CountryPicker;