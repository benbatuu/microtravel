'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Home,
    Plane,
    Star,
    Compass,
    User,
    Settings,
    Menu,
    X,
    LogOut,
    Bell,
    BarChart3,
    ChevronRightCircle,
    ChevronLeftCircle,
    CreditCard,
    Bookmark,
    Calendar,
    Camera,
    Map,
    TrendingUp,
    Zap,
    Plus,
    Search,
    Heart,
    Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    className?: string;
}

export default function ModernSidebar({ isCollapsed = false, onToggle, className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { profile, subscription, signOut } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const mainMenu = [
        {
            label: 'Overview',
            href: '/dashboard',
            icon: Home,
            description: 'Dashboard overview',
            shortcut: '⌘1'
        },
        {
            label: 'My Trips',
            href: '/dashboard/my-trips',
            icon: Plane,
            description: 'View your trips',
            badge: subscription && subscription.limits.experiences !== -1 ? `${subscription.limits.experiences}` : '∞',
            shortcut: '⌘2'
        },
        {
            label: 'Favorites',
            href: '/dashboard/favorites',
            icon: Heart,
            description: 'Saved destinations',
            shortcut: '⌘3'
        },
        {
            label: 'Explore',
            href: '/dashboard/explore',
            icon: Compass,
            description: 'Discover new places',
            shortcut: '⌘4'
        },
        {
            label: 'Analytics',
            href: '/dashboard/analytics',
            icon: BarChart3,
            description: 'Travel statistics',
            shortcut: '⌘5'
        }
    ];

    const quickActions = [
        {
            label: 'Add Experience',
            href: '/dashboard/my-trips?action=add',
            icon: Plus,
            description: 'Create new experience',
            shortcut: '⌘N'
        },
        {
            label: 'Search',
            href: '/dashboard/explore?focus=search',
            icon: Search,
            description: 'Search experiences',
            shortcut: '⌘K'
        },
        {
            label: 'Upload Photos',
            href: '/dashboard/my-trips?action=upload',
            icon: Camera,
            description: 'Upload travel photos',
            shortcut: '⌘U'
        }
    ];

    const accountMenu = [
        {
            label: 'Profile',
            href: '/dashboard/profile',
            icon: User,
            description: 'Manage profile'
        },
        {
            label: 'Subscription',
            href: '/dashboard/subscription',
            icon: CreditCard,
            description: 'Manage subscription',
            badge: subscription?.name || 'Free'
        },
        {
            label: 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
            description: 'App settings'
        },
    ];

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileOpen(false);
            }
        };

        if (isMobileOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isMobileOpen]);

    const storagePercentage = Math.min(
        (profile?.storage_used || 0) / (subscription?.limits.storage || 100 * 1024 * 1024) * 100,
        100
    );

    const experiencePercentage = subscription && subscription.limits.experiences !== -1
        ? Math.min((8 / subscription.limits.experiences) * 100, 100)
        : 0;

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const SidebarContent = () => (
        <TooltipProvider>
            <div className="flex flex-col h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50">
                {/* Logo/Brand Section with Collapse Button */}
                <div className={cn(
                    "flex items-center gap-3 px-4 py-6 relative border-b border-slate-200/50 dark:border-slate-700/50",
                    isCollapsed && "justify-center px-3"
                )}>
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="flex-1">
                                <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    MicroTravel
                                </h1>
                                <p className="text-xs text-muted-foreground">Explore the world</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={onToggle}
                                        >
                                            <ChevronLeftCircle className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Collapse sidebar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </>
                    )}
                    {isCollapsed && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2">
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all"
                                        onClick={onToggle}
                                    >
                                        <ChevronRightCircle className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Expand sidebar</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )}
                </div>

                {/* Main Navigation - Scrollable Area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Main Menu */}
                    <nav className="px-3 py-4 space-y-1">
                        {!isCollapsed && (
                            <div className="px-3 py-2">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Main
                                </h3>
                            </div>
                        )}
                        {mainMenu.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Tooltip key={item.href} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                                "hover:bg-slate-100 dark:hover:bg-slate-800",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                                isActive && "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25",
                                                isCollapsed && "justify-center px-3"
                                            )}
                                            onMouseEnter={() => setHoveredItem(item.href)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                        >
                                            <Icon className={cn(
                                                "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                                                hoveredItem === item.href && "scale-110",
                                                isActive && "text-white"
                                            )} />
                                            {!isCollapsed && (
                                                <>
                                                    <span className="truncate">{item.label}</span>
                                                    <div className="ml-auto flex items-center gap-2">
                                                        {item.badge && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                        {item.shortcut && (
                                                            <span className="text-xs text-muted-foreground opacity-60">
                                                                {item.shortcut}
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                            {isActive && (
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-100 -z-10" />
                                            )}
                                        </Link>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent side="right" className="font-medium">
                                            <p>{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                            {item.shortcut && (
                                                <p className="text-xs text-muted-foreground">{item.shortcut}</p>
                                            )}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            );
                        })}
                    </nav>

                    {/* Quick Actions */}
                    <div className="px-3 py-2">
                        {!isCollapsed && (
                            <div className="px-3 py-2">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Quick Actions
                                </h3>
                            </div>
                        )}
                        <nav className="space-y-1">
                            {quickActions.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Tooltip key={item.href} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                                                    "hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground",
                                                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                                    isCollapsed && "justify-center px-3"
                                                )}
                                                onMouseEnter={() => setHoveredItem(item.href)}
                                                onMouseLeave={() => setHoveredItem(null)}
                                            >
                                                <Icon className={cn(
                                                    "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                                                    hoveredItem === item.href && "scale-110"
                                                )} />
                                                {!isCollapsed && (
                                                    <>
                                                        <span className="truncate">{item.label}</span>
                                                        {item.shortcut && (
                                                            <span className="ml-auto text-xs text-muted-foreground opacity-60">
                                                                {item.shortcut}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        {isCollapsed && (
                                            <TooltipContent side="right" className="font-medium">
                                                <p>{item.label}</p>
                                                <p className="text-xs text-muted-foreground">{item.description}</p>
                                                {item.shortcut && (
                                                    <p className="text-xs text-muted-foreground">{item.shortcut}</p>
                                                )}
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Bottom Section - Fixed at bottom */}
                <div className="mt-auto">
                    {/* Usage Indicator*/}
                    {profile && subscription && (
                        <div className={cn(
                            "px-4 py-4 border-t border-slate-200 dark:border-slate-700",
                            isCollapsed && "px-3"
                        )}>
                            {isCollapsed ? (
                                <div className="space-y-3">
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <div className="flex justify-center">
                                                <div className="relative">
                                                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700">
                                                        <div
                                                            className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                                                            style={{
                                                                clipPath: `inset(0 ${100 - storagePercentage}% 0 0)`
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xs font-bold">
                                                            {Math.round(storagePercentage)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p className="font-medium">Storage Usage</p>
                                            <p className="text-xs">
                                                {((profile.storage_used || 0) / (1024 * 1024)).toFixed(1)} / {(subscription.limits.storage / (1024 * 1024)).toFixed(1)} MB
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground font-medium">Storage</span>
                                            <span className="font-semibold">
                                                {((profile.storage_used || 0) / (1024 * 1024)).toFixed(1)} / {(subscription.limits.storage / (1024 * 1024)).toFixed(1)} MB
                                            </span>
                                        </div>
                                        <Progress
                                            value={storagePercentage}
                                            className="h-2"
                                        />
                                    </div>

                                    {subscription.limits.experiences !== -1 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-medium">Experiences</span>
                                                <span className="font-semibold">
                                                    {subscription.limits.experiences} / {subscription.limits.experiences === -1 ? '∞' : subscription.limits.experiences}
                                                </span>
                                            </div>
                                            <Progress
                                                value={experiencePercentage}
                                                className="h-2"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Account Menu */}
                    <div className="px-3 py-2 border-t border-slate-200/50 dark:border-slate-700/50">
                        {!isCollapsed && (
                            <div className="px-3 py-2">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Account
                                </h3>
                            </div>
                        )}
                        <nav className="space-y-1">
                            {accountMenu.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Tooltip key={item.href} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                                                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                                    isActive && "bg-slate-100 dark:bg-slate-800 text-foreground",
                                                    isCollapsed && "justify-center px-3"
                                                )}
                                            >
                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                {!isCollapsed && (
                                                    <>
                                                        <span className="truncate">{item.label}</span>
                                                        {item.badge && (
                                                            <Badge variant="outline" className="ml-auto text-xs">
                                                                {item.badge}
                                                            </Badge>
                                                        )}
                                                    </>
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        {isCollapsed && (
                                            <TooltipContent side="right" className="font-medium">
                                                <p>{item.label}</p>
                                                <p className="text-xs text-muted-foreground">{item.description}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Logout Button */}
                    <div className="px-4 pb-4">
                        {isCollapsed ? (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={handleSignOut}
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                    <p>Sign Out</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={handleSignOut}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-white/80 backdrop-blur-sm border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700"
                onClick={() => setIsMobileOpen(true)}
            >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
            </Button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col transition-all duration-300 h-screen sticky top-0",
                isCollapsed ? "w-20" : "w-72",
                className
            )}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 transform transition-transform duration-300 md:hidden",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Close Button */}
                    <div className="flex justify-end p-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileOpen(false)}
                            className="h-8 w-8"
                        >
                            <X className="w-4 h-4" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                    </div>

                    <SidebarContent />
                </div>
            </aside>
        </>
    );
}