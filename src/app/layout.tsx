"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import './globals.css'
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <I18nProvider>
            <ErrorBoundary>
              <AuthProvider>
                <Header />
                <main className="flex-grow mx-auto w-full">
                  {children}
                </main>
                <Footer />
              </AuthProvider>
              <Toaster />
            </ErrorBoundary>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
