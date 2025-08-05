'use client';

import { useState } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/Dashboard/Header';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="flex bg-background">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={toggleSidebar}
            />

            {/* Main Content Area */}
            <div className={cn(
                "flex flex-col transition-all duration-300"
            )}>
                {/* Header */}
                <Header onMobileMenuToggle={toggleMobileMenu} />

                {/* Page Content */}
                <main className="flex w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
