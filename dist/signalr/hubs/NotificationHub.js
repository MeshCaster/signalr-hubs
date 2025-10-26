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
exports.NotificationHub = void 0;
const abstractions_1 = require("../core/abstractions");
class NotificationHub extends abstractions_1.BaseSignalRHub {
    constructor(config) {
        super(Object.assign(Object.assign({}, config), { hubName: 'notificationHub' }));
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
    onConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            // Sync unread count on connection
            this.unreadCount = yield this.invoke('GetUnreadCount');
        });
    }
    // Add custom notification listener
    addNotificationListener(callback) {
        this.notificationCallbacks.add(callback);
        return () => this.notificationCallbacks.delete(callback);
    }
    getUnreadCount() {
        return this.unreadCount;
    }
    markAsRead(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.invoke('MarkAsRead', notificationId);
        });
    }
    getNotifications() {
        return __awaiter(this, arguments, void 0, function* (limit = 20, offset = 0) {
            return this.invoke('GetNotifications', limit, offset);
        });
    }
}
exports.NotificationHub = NotificationHub;
