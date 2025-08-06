"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

interface ThemeContextType {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    systemTheme: string | undefined;
    resolvedTheme: string | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        // Fallback to next-themes hook if context is not available
        const { theme, setTheme, systemTheme, resolvedTheme } = require('next-themes').useTheme();
        return { theme, setTheme, systemTheme, resolvedTheme };
    }
    return context;
};