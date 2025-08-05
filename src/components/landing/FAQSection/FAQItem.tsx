"use client";

import { Plus, Minus } from "lucide-react";

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export function FAQItem({
    question,
    answer,
    isOpen = false,
    onToggle,
    className = "",
    style
}: FAQItemProps) {
    return (
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg transition-all duration-300 hover:shadow-xl ${className}`} style={style}>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-2xl"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {question}
                </h3>
                <div className="flex-shrink-0">
                    {isOpen ? (
                        <Minus className="w-5 h-5 text-purple-600 dark:text-purple-400 transform transition-transform duration-300" />
                    ) : (
                        <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400 transform transition-transform duration-300" />
                    )}
                </div>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}