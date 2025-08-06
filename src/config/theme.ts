export const themeConfig = {
    // Color palette - Elegant and minimal
    colors: {
        light: {
            background: "oklch(0.99 0.005 85)",
            foreground: "oklch(0.15 0.01 85)",
            card: "oklch(0.98 0.005 85)",
            cardForeground: "oklch(0.15 0.01 85)",
            popover: "oklch(0.98 0.005 85)",
            popoverForeground: "oklch(0.15 0.01 85)",
            primary: "oklch(0.25 0.02 85)",
            primaryForeground: "oklch(0.98 0.005 85)",
            secondary: "oklch(0.94 0.01 85)",
            secondaryForeground: "oklch(0.25 0.02 85)",
            muted: "oklch(0.95 0.008 85)",
            mutedForeground: "oklch(0.45 0.015 85)",
            accent: "oklch(0.92 0.015 85)",
            accentForeground: "oklch(0.25 0.02 85)",
            destructive: "oklch(0.55 0.15 25)",
            destructiveForeground: "oklch(0.98 0.005 85)",
            border: "oklch(0.88 0.01 85)",
            input: "oklch(0.92 0.008 85)",
            ring: "oklch(0.35 0.02 85)",
        },
        dark: {
            background: "oklch(0.08 0.01 85)",
            foreground: "oklch(0.92 0.008 85)",
            card: "oklch(0.12 0.015 85)",
            cardForeground: "oklch(0.92 0.008 85)",
            popover: "oklch(0.12 0.015 85)",
            popoverForeground: "oklch(0.92 0.008 85)",
            primary: "oklch(0.88 0.01 85)",
            primaryForeground: "oklch(0.12 0.015 85)",
            secondary: "oklch(0.18 0.02 85)",
            secondaryForeground: "oklch(0.88 0.01 85)",
            muted: "oklch(0.16 0.018 85)",
            mutedForeground: "oklch(0.65 0.012 85)",
            accent: "oklch(0.22 0.025 85)",
            accentForeground: "oklch(0.88 0.01 85)",
            destructive: "oklch(0.65 0.18 25)",
            destructiveForeground: "oklch(0.92 0.008 85)",
            border: "oklch(0.25 0.02 85)",
            input: "oklch(0.2 0.02 85)",
            ring: "oklch(0.75 0.015 85)",
        },
    },

    // Typography scale
    typography: {
        fontFamily: {
            sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
            mono: ["var(--font-geist-mono)", "monospace"],
        },
        fontSize: {
            xs: ["0.75rem", { lineHeight: "1rem" }],
            sm: ["0.875rem", { lineHeight: "1.25rem" }],
            base: ["1rem", { lineHeight: "1.5rem" }],
            lg: ["1.125rem", { lineHeight: "1.75rem" }],
            xl: ["1.25rem", { lineHeight: "1.75rem" }],
            "2xl": ["1.5rem", { lineHeight: "2rem" }],
            "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
            "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
            "5xl": ["3rem", { lineHeight: "1.1" }],
            "6xl": ["3.75rem", { lineHeight: "1.1" }],
        },
        fontWeight: {
            normal: "400",
            medium: "500",
            semibold: "600",
            bold: "700",
        },
    },

    // Spacing scale
    spacing: {
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
        "4xl": "6rem",
        "5xl": "8rem",
    },

    // Border radius
    borderRadius: {
        none: "0",
        sm: "0.125rem",
        base: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
    },

    // Shadows
    boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    },

    // Animation durations
    animation: {
        duration: {
            fast: "150ms",
            normal: "200ms",
            slow: "300ms",
            slower: "500ms",
        },
        easing: {
            default: "cubic-bezier(0.4, 0, 0.2, 1)",
            in: "cubic-bezier(0.4, 0, 1, 1)",
            out: "cubic-bezier(0, 0, 0.2, 1)",
            inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
    },

    // Breakpoints
    screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
    },
} as const;

export type ThemeConfig = typeof themeConfig;