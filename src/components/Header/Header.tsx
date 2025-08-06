"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Globe,
    Languages,
    UserPlus,
    Menu,
    X,
    User,
    LogOut,
    Settings,
    CreditCard,
    Home,
    Info,
    Mail,
    HelpCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "./DarkModeToggle";
import LanguagePicker from "./LanguagePicker";
//import CountryPicker from "./CountryPicker";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/contexts/I18nContext";
import { Separator } from "../ui/separator";

const Header: React.FC = () => {
    const { user, profile, signOut, loading } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        setMobileMenuOpen(false);
    };

    const navigationLinks = [
        { href: "/", label: t('navigation.home'), icon: Home },
        { href: "/about", label: t('navigation.about'), icon: Info },
        { href: "/contact", label: t('navigation.contact'), icon: Mail },
        { href: "/help", label: t('navigation.help'), icon: HelpCircle },
    ];

    const userMenuItems = user ? [
        { href: "/dashboard", label: t('navigation.dashboard'), icon: User },
        { href: "/dashboard/profile", label: t('navigation.profile'), icon: User },
        { href: "/dashboard/settings", label: t('navigation.settings'), icon: Settings },
        { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
    ] : [];

    const getUserInitials = (name?: string, email?: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (email) {
            return email.slice(0, 2).toUpperCase();
        }
        return 'U';
    };

    const getSubscriptionBadge = () => {
        if (!profile?.subscription_tier || profile.subscription_tier === 'free') return null;

        const tierColors = {
            explorer: 'bg-blue-500',
            traveler: 'bg-purple-500',
            enterprise: 'bg-gold-500'
        };

        return (
            <Badge
                variant="secondary"
                className={`text-xs ${tierColors[profile.subscription_tier as keyof typeof tierColors] || 'bg-gray-500'} text-white`}
            >
                {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)}
            </Badge>
        );
    };

    return (
        <header className="w-full mx-auto bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
            <div className="mx-auto px-4 sm:px-6">
                <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="group flex items-center space-x-3 flex-shrink-0"
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm">
                            <Globe className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
                        </div>
                        <span className="text-lg sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors hidden sm:block">
                            {t('header.brand')}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Controls */}
                    <div className="hidden md:flex items-center space-x-2">
                        {/* Country Picker */}
                        {/* <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-2 lg:px-3"
                                >
                                    <Globe className="w-4 h-4 mr-1 lg:mr-2" />
                                    <span className="hidden lg:inline">{t('header.country')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2">
                                <CountryPicker />
                            </DropdownMenuContent>
                        </DropdownMenu> */}

                        {/* Language Picker */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-2 lg:px-3"
                                >
                                    <Languages className="w-4 h-4 mr-1 lg:mr-2" />
                                    <span className="hidden lg:inline">{t('header.language')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2">
                                <LanguagePicker />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Auth Section */}
                        <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
                            {loading ? (
                                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                            ) : user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email || ''} />
                                                <AvatarFallback className="text-xs">
                                                    {getUserInitials(profile?.full_name || '', user.email || '')}
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
                                                    {user.email}
                                                </p>
                                                <div className="flex items-center space-x-2 pt-1">
                                                    {getSubscriptionBadge()}
                                                </div>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {userMenuItems.map((item) => (
                                            <DropdownMenuItem key={item.href} asChild>
                                                <Link href={item.href} className="cursor-pointer">
                                                    <item.icon className="mr-2 h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>{t('navigation.logout')}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Button size="sm" asChild>
                                        <Link href="/getstarted">
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            {t('navigation.getStarted')}
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
                <Separator className="hidden md:block my-2 w-full" />

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {/* Navigation Links */}
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <link.icon className="mr-3 h-5 w-5" />
                                    {link.label}
                                </Link>
                            ))}

                            {/* User Section */}
                            {user ? (
                                <>
                                    <div className="border-t border-border pt-4 mt-4">
                                        <div className="flex items-center px-3 py-2">
                                            <Avatar className="h-8 w-8 mr-3">
                                                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email || ''} />
                                                <AvatarFallback className="text-xs">
                                                    {getUserInitials(profile?.full_name || '', user.email || '')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">
                                                    {profile?.full_name || 'User'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </div>
                                                {getSubscriptionBadge() && (
                                                    <div className="mt-1">
                                                        {getSubscriptionBadge()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {userMenuItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <item.icon className="mr-3 h-5 w-5" />
                                                {item.label}
                                            </Link>
                                        ))}
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-accent rounded-md transition-colors"
                                        >
                                            <LogOut className="mr-3 h-5 w-5" />
                                            {t('navigation.logout')}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="border-t border-border pt-4 mt-4 space-y-2">
                                    <Link
                                        href="/getstarted"
                                        className="flex items-center px-3 py-2 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <UserPlus className="mr-3 h-5 w-5" />
                                        {t('navigation.getStarted')}
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Controls */}
                            <div className="border-t border-border pt-4 mt-4">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-sm font-medium text-muted-foreground">Settings</span>
                                    <div className="flex items-center space-x-2">
                                        {/* <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <Globe className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-2">
                                                <CountryPicker />
                                            </DropdownMenuContent>
                                        </DropdownMenu> */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <Languages className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-2">
                                                <LanguagePicker />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;