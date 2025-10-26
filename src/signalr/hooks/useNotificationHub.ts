// src/signalr/hooks/useNotificationHub.ts
import { useCallback, useEffect, useState } from 'react';
import { NotificationHub } from '../hubs/NotificationHub';
import { useHub } from './useHub';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
    read: boolean;
}

export interface UseNotificationHubOptions {
    onNotificationReceived?: (notification: Notification) => void;
    autoMarkAsRead?: boolean;
    maxNotifications?: number;
}

export function useNotificationHub(options: UseNotificationHubOptions = {}) {
    const {
        onNotificationReceived,
        autoMarkAsRead = false,
        maxNotifications = 50,
    } = options;

    const { connectionState, connect, disconnect, invoke, on, isConnected } =
        useHub<NotificationHub>('notifications');

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const subscriptions = [
            on('ReceiveNotification', (notification: Notification) => {
                setNotifications((prev) => {
                    const updated = [{ ...notification, read: false }, ...prev];
                    return updated.slice(0, maxNotifications);
                });
                setUnreadCount((prev) => prev + 1);
                onNotificationReceived?.(notification);

                if (autoMarkAsRead) {
                    setTimeout(() => markAsRead(notification.id), 3000);
                }
            }),

            on('NotificationRead', (notificationId: string) => {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }),

            on('NotificationDeleted', (notificationId: string) => {
                setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            }),

            on('BulkNotifications', (newNotifications: Notification[]) => {
                setNotifications((prev) => {
                    const combined = [...newNotifications, ...prev];
                    return combined.slice(0, maxNotifications);
                });
            }),
        ];

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [on, onNotificationReceived, autoMarkAsRead, maxNotifications]);

    // Sync unread count on connection
    useEffect(() => {
        if (isConnected) {
            invoke('GetUnreadCount').then((count: number) => {
                setUnreadCount(count);
            });
        }
    }, [isConnected, invoke]);

    const markAsRead = useCallback(
        async (notificationId: string) => {
            try {
                await invoke('MarkAsRead', notificationId);
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        },
        [invoke]
    );

    const deleteNotification = useCallback(
        async (notificationId: string) => {
            try {
                await invoke('DeleteNotification', notificationId);
            } catch (error) {
                console.error('Failed to delete notification:', error);
            }
        },
        [invoke]
    );

    const getNotifications = useCallback(
        async (limit: number = 20, offset: number = 0) => {
            try {
                return await invoke('GetNotifications', limit, offset);
            } catch (error) {
                console.error('Failed to get notifications:', error);
                return [];
            }
        },
        [invoke]
    );

    const subscribeToCategory = useCallback(
        async (category: string) => {
            try {
                await invoke('SubscribeToCategory', category);
            } catch (error) {
                console.error('Failed to subscribe to category:', error);
            }
        },
        [invoke]
    );

    const markAllAsRead = useCallback(async () => {
        try {
            const unreadIds = notifications
                .filter((n) => !n.read)
                .map((n) => n.id);

            await Promise.all(unreadIds.map((id) => markAsRead(id)));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, [notifications, markAsRead]);

    return {
        ...connectionState,
        connect,
        disconnect,
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        getNotifications,
        subscribeToCategory,
        markAllAsRead,
        clearNotifications: () => setNotifications([]),
    };
}