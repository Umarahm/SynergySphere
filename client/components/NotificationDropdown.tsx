import React, { useState, useEffect } from 'react';
import { Bell, User } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@shared/api';

export function NotificationDropdown({ className }: { className?: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { token, user } = useAuth();

    const fetchNotifications = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unread_count || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        if (!token) return;
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId ? { ...notif, is_read: true } : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const diffMs = new Date().getTime() - new Date(dateString).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user, token]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    size='icon'
                    className={`relative bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 flex-shrink-0 p-2 lg:p-3 ${className}`}
                >
                    <Bell className='w-4 lg:w-5 h-4 lg:h-5' />
                    {unreadCount > 0 && (
                        <Badge className='absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full'>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-80 bg-card border-border'>
                <DropdownMenuLabel className='font-aeonik text-sidebar-foreground'>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading ? (
                    <div className='flex items-center justify-center py-4'>
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-sidebar-primary'></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className='text-center py-8 text-sidebar-foreground/70'>
                        <Bell className='w-8 h-8 mx-auto mb-2 opacity-50' />
                        <p className='font-aeonik text-sm'>No notifications yet</p>
                    </div>
                ) : (
                    <ScrollArea className='h-[300px]'>
                        {notifications.slice(0, 10).map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.is_read ? 'bg-sidebar-accent/10' : ''}`}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                            >
                                <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500'>
                                    <User className='w-4 h-4' />
                                </div>
                                <div className='flex-1'>
                                    <h4 className='font-aeonik text-sm font-medium text-sidebar-foreground'>{notification.title}</h4>
                                    <p className='font-aeonik text-xs text-sidebar-foreground/70 mt-1'>{notification.message}</p>
                                    <p className='font-aeonik text-xs text-sidebar-foreground/50 mt-1'>{formatTimeAgo(notification.created_at.toString())}</p>
                                </div>
                                {!notification.is_read && <div className='w-2 h-2 bg-sidebar-primary rounded-full' />}
                            </DropdownMenuItem>
                        ))}
                    </ScrollArea>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}