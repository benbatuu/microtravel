import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Elegant spacing scale
export const spacing = {
    xs: "0.5rem",    // 8px
    sm: "0.75rem",   // 12px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem",   // 64px
    "4xl": "6rem",   // 96px
    "5xl": "8rem",   // 128px
} as const;

// Elegant typography scale
export const typography = {
    xs: {
        fontSize: "0.75rem",
        lineHeight: "1rem",
    },
    sm: {
        fontSize: "0.875rem",
        lineHeight: "1.25rem",
    },
    base: {
        fontSize: "1rem",
        lineHeight: "1.5rem",
    },
    lg: {
        fontSize: "1.125rem",
        lineHeight: "1.75rem",
    },
    xl: {
        fontSize: "1.25rem",
        lineHeight: "1.75rem",
    },
    "2xl": {
        fontSize: "1.5rem",
        lineHeight: "2rem",
    },
    "3xl": {
        fontSize: "1.875rem",
        lineHeight: "2.25rem",
    },
    "4xl": {
        fontSize: "2.25rem",
        lineHeight: "2.5rem",
    },
    "5xl": {
        fontSize: "3rem",
        lineHeight: "1",
    },
    "6xl": {
        fontSize: "3.75rem",
        lineHeight: "1",
    },
} as const;

// Elegant shadow scale
export const shadows = {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

// Elegant border radius scale
export const borderRadius = {
    none: "0px",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
} as const;

// Theme-aware color utilities
export const getThemeColors = (isDark: boolean) => ({
    background: isDark ? "oklch(0.08 0.01 85)" : "oklch(0.99 0.005 85)",
    foreground: isDark ? "oklch(0.92 0.008 85)" : "oklch(0.15 0.01 85)",
    primary: isDark ? "oklch(0.88 0.01 85)" : "oklch(0.25 0.02 85)",
    secondary: isDark ? "oklch(0.18 0.02 85)" : "oklch(0.94 0.01 85)",
    muted: isDark ? "oklch(0.16 0.018 85)" : "oklch(0.95 0.008 85)",
    accent: isDark ? "oklch(0.22 0.025 85)" : "oklch(0.92 0.015 85)",
    border: isDark ? "oklch(0.25 0.02 85)" : "oklch(0.88 0.01 85)",
});

// Animation utilities
export const animations = {
    fadeIn: "fade-in 0.6s ease-out",
    slideInFromBottom: "slide-in-from-bottom 0.6s ease-out",
    slideInFromTop: "slide-in-from-top 0.3s ease-out",
    blob: "blob 7s infinite",
} as const;

// Responsive breakpoints
export const breakpoints = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
} as const;