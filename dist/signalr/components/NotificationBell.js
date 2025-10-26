"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationBell = void 0;
// src/components/NotificationBell.tsx
const react_1 = __importStar(require("react"));
const useNotificationHub_1 = require("../hooks/useNotificationHub");
const NotificationBell = () => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const { notifications, unreadCount, markAsRead, deleteNotification, markAllAsRead, } = (0, useNotificationHub_1.useNotificationHub)({
        onNotificationReceived: (notification) => {
            // Show toast notification
            console.log('New notification:', notification);
        },
        autoMarkAsRead: false,
    });
    return (react_1.default.createElement("div", { className: "notification-bell" },
        react_1.default.createElement("button", { onClick: () => setIsOpen(!isOpen) },
            "\uD83D\uDD14",
            unreadCount > 0 && (react_1.default.createElement("span", { className: "badge" }, unreadCount))),
        isOpen && (react_1.default.createElement("div", { className: "notification-dropdown" },
            react_1.default.createElement("div", { className: "notification-header" },
                react_1.default.createElement("h3", null, "Notifications"),
                unreadCount > 0 && (react_1.default.createElement("button", { onClick: markAllAsRead }, "Mark all as read"))),
            react_1.default.createElement("div", { className: "notification-list" }, notifications.length === 0 ? (react_1.default.createElement("div", { className: "no-notifications" }, "No notifications")) : (notifications.map((notification) => (react_1.default.createElement("div", { key: notification.id, className: `notification-item ${notification.read ? 'read' : 'unread'}` },
                react_1.default.createElement("div", { className: "notification-content" },
                    react_1.default.createElement("h4", null, notification.title),
                    react_1.default.createElement("p", null, notification.message),
                    react_1.default.createElement("span", { className: "timestamp" }, new Date(notification.timestamp).toLocaleString())),
                react_1.default.createElement("div", { className: "notification-actions" },
                    !notification.read && (react_1.default.createElement("button", { onClick: () => markAsRead(notification.id) }, "Mark as read")),
                    react_1.default.createElement("button", { onClick: () => deleteNotification(notification.id) }, "Delete")))))))))));
};
exports.NotificationBell = NotificationBell;
//# sourceMappingURL=NotificationBell.js.map