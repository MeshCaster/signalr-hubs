"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHub = void 0;
const abstractions_1 = require("../core/abstractions");
class NotificationHub extends abstractions_1.BaseSignalRHub {
    constructor(config) {
        super({
            ...config,
            hubName: 'notificationHub',
        });
        this.unreadCount = 0;
        this.notificationCallbacks = new Set();
        // Setup default handlers
        this.setupDefaultHandlers();
    }
    setupDefaultHandlers() {
        this.on('ReceiveNotification', (notification) => {
            this.unreadCount++;
            this.notificationCallbacks.forEach(cb => cb(notification));
        });
        this.on('NotificationRead', () => {
            if (this.unreadCount > 0) {
                this.unreadCount--;
            }
        });
    }
    async onConnected() {
        // Sync unread count on connection
        this.unreadCount = await this.invoke('GetUnreadCount');
    }
    // Add custom notification listener
    addNotificationListener(callback) {
        this.notificationCallbacks.add(callback);
        return () => this.notificationCallbacks.delete(callback);
    }
    getUnreadCount() {
        return this.unreadCount;
    }
    async markAsRead(notificationId) {
        await this.invoke('MarkAsRead', notificationId);
    }
    async getNotifications(limit = 20, offset = 0) {
        return this.invoke('GetNotifications', limit, offset);
    }
}
exports.NotificationHub = NotificationHub;
//# sourceMappingURL=NotificationHub.js.map