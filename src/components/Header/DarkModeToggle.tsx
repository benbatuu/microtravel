import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DarkModeToggleProps {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ darkMode, setDarkMode }) => {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 p-0 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Toggle Dark Mode"
        >
            <div className="relative w-full h-full flex items-center justify-center">
                <Sun className={`w-4 h-4 transition-all duration-200 ${darkMode
                    ? 'rotate-90 scale-0 opacity-0'
                    : 'rotate-0 scale-100 opacity-100'
                    }`} />
                <Moon className={`w-4 h-4 absolute transition-all duration-200 ${darkMode
                    ? 'rotate-0 scale-100 opacity-100'
                    : '-rotate-90 scale-0 opacity-0'
                    }`} />
            </div>
        </Button>
    );
};

export default DarkModeToggle;