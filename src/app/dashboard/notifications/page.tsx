'use client';

import { useState, useMemo } from 'react';
import {
    Bell,
    Calendar,
    Heart,
    User,
    Search,
    MoreVertical,
    Trash2,
    Eye,
    EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import ContentArea from '@/components/Dashboard/ContentArea';

interface Notification {
    id: string;
    type: 'trip' | 'favorite' | 'social' | 'system';
    title: string;
    message: string;
    time: string;
    date: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
    actionUrl?: string;
    sender?: string;
}

// Sample notifications data
const allNotifications: Notification[] = [
    {
        id: '1',
        type: 'trip',
        title: 'Trip Reminder',
        message: 'Your trip to Paris starts tomorrow! Make sure you have all your documents ready.',
        time: '2 hours ago',
        date: '2025-08-05',
        isRead: false,
        priority: 'high',
        actionUrl: '/dashboard/my-trips',
        sender: 'System'
    },
    {
        id: '2',
        type: 'favorite',
        title: 'New Experience Available',
        message: 'A new experience "Seine River Cruise" has been added to your favorite location: Paris',
        time: '5 hours ago',
        date: '2025-08-05',
        isRead: false,
        priority: 'medium',
        actionUrl: '/dashboard/favorites'
    },
    {
        id: '3',
        type: 'social',
        title: 'Friend Activity',
        message: 'John shared a new experience "Hidden Gems of Istanbul" with you',
        time: '1 day ago',
        date: '2025-08-04',
        isRead: true,
        priority: 'low',
        actionUrl: '/dashboard/explore',
        sender: 'John Doe'
    },
    {
        id: '4',
        type: 'system',
        title: 'Account Update',
        message: 'Your Premium subscription will renew in 3 days. Manage your subscription settings.',
        time: '2 days ago',
        date: '2025-08-03',
        isRead: true,
        priority: 'medium',
        actionUrl: '/dashboard/settings?tab=subscription',
        sender: 'System'
    },
    {
        id: '5',
        type: 'trip',
        title: 'Booking Confirmation',
        message: 'Your booking for "Eiffel Tower Skip-the-Line" has been confirmed for August 10th.',
        time: '3 days ago',
        date: '2025-08-02',
        isRead: true,
        priority: 'high',
        actionUrl: '/dashboard/my-trips'
    },
    {
        id: '6',
        type: 'favorite',
        title: 'Price Drop Alert',
        message: 'Great news! The price for "Tokyo Food Tour" in your favorites has dropped by 20%.',
        time: '4 days ago',
        date: '2025-08-01',
        isRead: false,
        priority: 'medium',
        actionUrl: '/dashboard/favorites'
    },
    {
        id: '7',
        type: 'social',
        title: 'New Follower',
        message: 'Sarah Wilson started following you and liked your recent Rome trip review.',
        time: '5 days ago',
        date: '2025-07-31',
        isRead: true,
        priority: 'low',
        actionUrl: '/dashboard/profile',
        sender: 'Sarah Wilson'
    },
    {
        id: '8',
        type: 'system',
        title: 'Security Alert',
        message: 'New login detected from Istanbul, Turkey. If this wasn\'t you, secure your account.',
        time: '1 week ago',
        date: '2025-07-29',
        isRead: true,
        priority: 'high',
        actionUrl: '/dashboard/settings?tab=security',
        sender: 'Security Team'
    }
];

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'trip':
            return <Calendar className="h-5 w-5 text-blue-500" />;
        case 'favorite':
            return <Heart className="h-5 w-5 text-red-500" />;
        case 'social':
            return <User className="h-5 w-5 text-green-500" />;
        case 'system':
            return <Bell className="h-5 w-5 text-orange-500" />;
        default:
            return <Bell className="h-5 w-5 text-gray-500" />;
    }
};

const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(allNotifications);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('newest');

    // Filter and search notifications
    const filteredNotifications = useMemo(() => {
        const filtered = notifications.filter(notification => {
            const matchesSearch =
                notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.sender?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesType = selectedType === 'all' || notification.type === selectedType;
            const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
            const matchesStatus = selectedStatus === 'all' ||
                (selectedStatus === 'read' && notification.isRead) ||
                (selectedStatus === 'unread' && !notification.isRead);

            return matchesSearch && matchesType && matchesPriority && matchesStatus;
        });

        // Sort notifications
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'oldest':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'type':
                    return a.type.localeCompare(b.type);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [notifications, searchQuery, selectedType, selectedPriority, selectedStatus, sortBy]);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const selectedCount = selectedNotifications.length;

    const handleSelectAll = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(n => n.id));
        }
    };

    const handleSelectNotification = (id: string) => {
        setSelectedNotifications(prev =>
            prev.includes(id)
                ? prev.filter(nId => nId !== id)
                : [...prev, id]
        );
    };

    const handleMarkAsRead = (ids: string[]) => {
        setNotifications(prev =>
            prev.map(notification =>
                ids.includes(notification.id)
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
        setSelectedNotifications([]);
    };

    const handleMarkAsUnread = (ids: string[]) => {
        setNotifications(prev =>
            prev.map(notification =>
                ids.includes(notification.id)
                    ? { ...notification, isRead: false }
                    : notification
            )
        );
        setSelectedNotifications([]);
    };

    const handleDelete = (ids: string[]) => {
        setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
        setSelectedNotifications([]);
    };

    return (
        <ContentArea>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">
                        Stay updated with your latest activities and alerts
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                        {unreadCount} unread
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                        {filteredNotifications.length} total
                    </Badge>
                </div>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="trip">Trip</SelectItem>
                                    <SelectItem value="favorite">Favorite</SelectItem>
                                    <SelectItem value="social">Social</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="unread">Unread</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                    <SelectItem value="priority">Priority</SelectItem>
                                    <SelectItem value="type">Type</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                {/* Bulk Actions */}
                {(selectedCount > 0 || filteredNotifications.length > 0) && (
                    <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={selectedCount === filteredNotifications.length && filteredNotifications.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <label htmlFor="select-all" className="text-sm font-medium">
                                        Select all ({filteredNotifications.length})
                                    </label>
                                </div>
                                {selectedCount > 0 && (
                                    <Badge variant="secondary">{selectedCount} selected</Badge>
                                )}
                            </div>

                            {selectedCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMarkAsRead(selectedNotifications)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Mark as Read
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMarkAsUnread(selectedNotifications)}
                                    >
                                        <EyeOff className="w-4 h-4 mr-1" />
                                        Mark as Unread
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(selectedNotifications)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                            <p className="text-muted-foreground text-center">
                                {searchQuery || selectedType !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all'
                                    ? "Try adjusting your search or filters"
                                    : "You're all caught up! No new notifications."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`transition-colors ${!notification.isRead
                                ? 'border-l-4 border-l-blue-500 bg-blue-50/30'
                                : 'hover:bg-muted/50'
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Checkbox
                                        checked={selectedNotifications.includes(notification.id)}
                                        onCheckedChange={() => handleSelectNotification(notification.id)}
                                        className="mt-1"
                                    />

                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                    {notification.title}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getPriorityColor(notification.priority)}`}
                                                >
                                                    {notification.priority}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs capitalize">
                                                    {notification.type}
                                                </Badge>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() =>
                                                        notification.isRead
                                                            ? handleMarkAsUnread([notification.id])
                                                            : handleMarkAsRead([notification.id])
                                                    }>
                                                        {notification.isRead ? (
                                                            <>
                                                                <EyeOff className="mr-2 h-4 w-4" />
                                                                Mark as Unread
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Mark as Read
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete([notification.id])}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{notification.time}</span>
                                                {notification.sender && (
                                                    <>
                                                        <Separator orientation="vertical" className="h-3" />
                                                        <span>From: {notification.sender}</span>
                                                    </>
                                                )}
                                            </div>

                                            {notification.actionUrl && (
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={notification.actionUrl}>
                                                        View Details
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </ContentArea>
    );
}