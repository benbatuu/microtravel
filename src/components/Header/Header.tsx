"use client";

import React from "react";
import Link from "next/link";
import { Globe, Languages, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import DarkModeToggle from "./DarkModeToggle";
import LanguagePicker from "./LanguagePicker";
import CountryPicker from "./CountryPicker";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

interface HeaderProps {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
    const { user } = useAuthRedirect();

    return (
        <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto flex items-center justify-between py-4 px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="group flex items-center space-x-2"
                >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                        MicroTravel
                    </span>
                </Link>

                {/* Nav & Controls */}
                <nav className="flex items-center space-x-3">
                    {/* Country Picker Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="min-w-[100px] h-9 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                Ülke
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 p-2 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800"
                        >
                            <CountryPicker />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Language Picker Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="min-w-[100px] h-9 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Languages className="w-4 h-4 mr-2" />
                                Dil
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 p-2 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800"
                        >
                            <LanguagePicker />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Dark Mode Toggle */}
                    <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
                        {
                            user ? (
                                <Link href="/dashboard" passHref>
                                    <Button variant="outline" size="sm">
                                        Profil
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/getstarted" passHref>
                                    <Button
                                        size="sm"
                                        className="h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Get Started
                                    </Button>
                                </Link>
                            )
                        }
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;