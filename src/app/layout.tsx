"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import React, { useState, useEffect } from "react";
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") setDarkMode(true);
    else setDarkMode(false);
  }, []);

  // darkMode değiştiğinde localStorage'a yaz ve sınıf ekle/kaldır
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen flex flex-col">
        <AuthProvider>
          <main className="flex-grow mx-auto w-full max-w-[1600px]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
