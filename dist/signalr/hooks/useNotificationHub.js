"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
                    const updated = [Object.assign(Object.assign({}, notification), { read: false }), ...prev];
                    return updated.slice(0, maxNotifications);
                });
                setUnreadCount((prev) => prev + 1);
                onNotificationReceived === null || onNotificationReceived === void 0 ? void 0 : onNotificationReceived(notification);
                if (autoMarkAsRead) {
                    setTimeout(() => markAsRead(notification.id), 3000);
                }
            }),
            on('NotificationRead', (notificationId) => {
                setNotifications((prev) => prev.map((n) => (n.id === notificationId ? Object.assign(Object.assign({}, n), { read: true }) : n)));
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
    const markAsRead = (0, react_1.useCallback)((notificationId) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield invoke('MarkAsRead', notificationId);
        }
        catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }), [invoke]);
    const deleteNotification = (0, react_1.useCallback)((notificationId) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield invoke('DeleteNotification', notificationId);
        }
        catch (error) {
            console.error('Failed to delete notification:', error);
        }
    }), [invoke]);
    const getNotifications = (0, react_1.useCallback)((...args_1) => __awaiter(this, [...args_1], void 0, function* (limit = 20, offset = 0) {
        try {
            return yield invoke('GetNotifications', limit, offset);
        }
        catch (error) {
            console.error('Failed to get notifications:', error);
            return [];
        }
    }), [invoke]);
    const subscribeToCategory = (0, react_1.useCallback)((category) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield invoke('SubscribeToCategory', category);
        }
        catch (error) {
            console.error('Failed to subscribe to category:', error);
        }
    }), [invoke]);
    const markAllAsRead = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        try {
            const unreadIds = notifications
                .filter((n) => !n.read)
                .map((n) => n.id);
            yield Promise.all(unreadIds.map((id) => markAsRead(id)));
        }
        catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }), [notifications, markAsRead]);
    return Object.assign(Object.assign({}, connectionState), { connect,
        disconnect,
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        getNotifications,
        subscribeToCategory,
        markAllAsRead, clearNotifications: () => setNotifications([]) });
}
