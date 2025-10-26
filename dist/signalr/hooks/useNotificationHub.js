"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotificationHub = useNotificationHub;
// src/signalr/hooks/useNotificationHub.ts
const react_1 = require("react");
const useHub_1 = require("./useHub");
function useNotificationHub(options = {}) {
    const { onNotificationReceived, autoMarkAsRead = false, maxNotifications = 50, } = options;
    const { connectionState, connect, disconnect, invoke, on, isConnected } = (0, useHub_1.useHub)('notifications');
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const [unreadCount, setUnreadCount] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const subscriptions = [
            on('ReceiveNotification', (notification) => {
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
            on('NotificationRead', (notificationId) => {
                setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }),
            on('NotificationDeleted', (notificationId) => {
                setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            }),
            on('BulkNotifications', (newNotifications) => {
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
    (0, react_1.useEffect)(() => {
        if (isConnected) {
            invoke('GetUnreadCount').then((count) => {
                setUnreadCount(count);
            });
        }
    }, [isConnected, invoke]);
    const markAsRead = (0, react_1.useCallback)(async (notificationId) => {
        try {
            await invoke('MarkAsRead', notificationId);
        }
        catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, [invoke]);
    const deleteNotification = (0, react_1.useCallback)(async (notificationId) => {
        try {
            await invoke('DeleteNotification', notificationId);
        }
        catch (error) {
            console.error('Failed to delete notification:', error);
        }
    }, [invoke]);
    const getNotifications = (0, react_1.useCallback)(async (limit = 20, offset = 0) => {
        try {
            return await invoke('GetNotifications', limit, offset);
        }
        catch (error) {
            console.error('Failed to get notifications:', error);
            return [];
        }
    }, [invoke]);
    const subscribeToCategory = (0, react_1.useCallback)(async (category) => {
        try {
            await invoke('SubscribeToCategory', category);
        }
        catch (error) {
            console.error('Failed to subscribe to category:', error);
        }
    }, [invoke]);
    const markAllAsRead = (0, react_1.useCallback)(async () => {
        try {
            const unreadIds = notifications
                .filter((n) => !n.read)
                .map((n) => n.id);
            await Promise.all(unreadIds.map((id) => markAsRead(id)));
        }
        catch (error) {
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
//# sourceMappingURL=useNotificationHub.js.map