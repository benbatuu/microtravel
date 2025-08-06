'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronRight, Search, User, Settings, LogOut, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ThemeSelector } from '@/components/ThemeSelector'
import { LanguageSelector } from '@/components/LanguageSelector';
import { NotificationsDropdown } from '@/components/NotificationDropdown';

interface HeaderProps {
    onMobileMenuToggle?: () => void;
    className?: string;
}

const routeLabels: Record<string, string> = {
    '/dashboard': 'Overview',
    '/dashboard/my-trips': 'My Trips',
    '/dashboard/favorites': 'Favorites',
    '/dashboard/explore': 'Explore',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/profile': 'Profile',
    '/dashboard/settings': 'Settings',
    '/dashboard/subscription': 'Subscription',
    '/dashboard/billing': 'Billing',
    '/dashboard/notifications': 'Notifications',
    '/dashboard/payment-methods': 'Payment Methods',
    '/dashboard/delete-account': 'Delete Account',
};

export default function Header({ className }: HeaderProps) {
    const pathname = usePathname();
    const { profile, subscription, isSubscribed, signOut } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    // Generate breadcrumbs from pathname
    const generateBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs = [];

        let currentPath = '';
        for (const segment of segments) {
            currentPath += `/${segment}`;
            const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
            breadcrumbs.push({
                label,
                href: currentPath,
                isLast: currentPath === pathname
            });
        }

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className={"sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b w-screen max-w-7xl"}>
            <div className="w-full flex items-center justify-between px-4 py-3 md:px-6">
                {/* Left Section - Mobile Menu + Breadcrumbs */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-1 text-sm text-muted-foreground min-w-0">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.href} className="flex items-center">
                                {index > 0 && (
                                    <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" />
                                )}
                                {crumb.isLast ? (
                                    <span className="font-medium text-foreground truncate">
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="hover:text-foreground transition-colors truncate"
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Center Section - Search (hidden on mobile) */}
                <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search experiences..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4"
                        />
                    </div>
                </div>

                {/* Right Section - Theme, Language, Notifications + User Menu */}
                <div className="flex items-center gap-2">
                    {/* Search Button (mobile only) */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                    >
                        <Search className="w-5 h-5" />
                        <span className="sr-only">Search</span>
                    </Button>

                    {/* Theme Selector */}
                    <ThemeSelector />

                    {/* Language Selector */}
                    <LanguageSelector />

                    {/* Notifications */}
                    <NotificationsDropdown />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-full"
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={profile?.avatar_url || undefined}
                                        alt={profile?.full_name || 'User'}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {profile?.full_name || 'User'}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {profile?.email}
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Badge
                                            variant={isSubscribed ? "default" : "secondary"}
                                            className="text-xs"
                                        >
                                            {isSubscribed && <Crown className="w-3 h-3 mr-1" />}
                                            {subscription?.name || 'Free'}
                                        </Badge>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile" className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/subscription" className="cursor-pointer">
                                    <Crown className="mr-2 h-4 w-4" />
                                    <span>Subscription</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            {!isSubscribed && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/subscription" className="cursor-pointer text-blue-600">
                                            <Crown className="mr-2 h-4 w-4" />
                                            <span>Upgrade Plan</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}