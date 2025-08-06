"use client";

import React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

const ThemeToggle: React.FC = () => {
    const { theme, setTheme, systemTheme } = useTheme();

    const getThemeIcon = () => {
        if (theme === "system") {
            return systemTheme === "dark" ? (
                <Moon className="w-4 h-4" />
            ) : (
                <Sun className="w-4 h-4" />
            );
        }
        return theme === "dark" ? (
            <Moon className="w-4 h-4" />
        ) : (
            <Sun className="w-4 h-4" />
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-9 h-9 p-0 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                    aria-label="Toggle theme"
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        {getThemeIcon()}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="cursor-pointer"
                >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="cursor-pointer"
                >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="cursor-pointer"
                >
                    <Monitor className="w-4 h-4 mr-2" />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ThemeToggle;