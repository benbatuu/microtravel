'use client';

import { Bell, Calendar, MapPin, Heart, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface Notification {
    id: string;
    type: 'trip' | 'favorite' | 'social' | 'system';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    actionUrl?: string;
}

// Sample notifications data
const notifications: Notification[] = [
    {
        id: '1',
        type: 'trip',
        title: 'Trip Reminder',
        message: 'Your trip to Paris starts tomorrow!',
        time: '2 hours ago',
        isRead: false,
        actionUrl: '/dashboard/my-trips'
    },
    {
        id: '2',
        type: 'favorite',
        title: 'New Experience Available',
        message: 'A new experience has been added to your favorite location: Istanbul',
        time: '5 hours ago',
        isRead: false,
        actionUrl: '/dashboard/favorites'
    },
    {
        id: '3',
        type: 'social',
        title: 'Friend Activity',
        message: 'John shared a new experience with you',
        time: '1 day ago',
        isRead: true,
        actionUrl: '/dashboard/explore'
    },
    {
        id: '4',
        type: 'system',
        title: 'Account Update',
        message: 'Your subscription will renew in 3 days',
        time: '2 days ago',
        isRead: true,
        actionUrl: '/dashboard/settings?tab=subscription'
    },
];

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'trip':
            return <Calendar className="h-4 w-4 text-blue-500" />;
        case 'favorite':
            return <Heart className="h-4 w-4 text-red-500" />;
        case 'social':
            return <User className="h-4 w-4 text-green-500" />;
        case 'system':
            return <Bell className="h-4 w-4 text-orange-500" />;
        default:
            return <Bell className="h-4 w-4 text-gray-500" />;
    }
};

export function NotificationsDropdown() {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="sr-only">Notifications</span>
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {unreadCount} new
                        </Badge>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className="cursor-pointer p-3 flex items-start gap-3 hover:bg-muted/50"
                                    asChild
                                >
                                    <Link href={notification.actionUrl || '#'}>
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-sm font-medium truncate ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href="/dashboard/notifications"
                        className="cursor-pointer flex items-center justify-center py-2 text-sm font-medium"
                    >
                        View all notifications
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}