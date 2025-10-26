"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMultipleHubs = useMultipleHubs;
// src/signalr/hooks/useMultipleHubs.ts
const useChatHub_1 = require("./useChatHub");
const useNotificationHub_1 = require("./useNotificationHub");
function useMultipleHubs() {
    const chat = (0, useChatHub_1.useChatHub)();
    const notifications = (0, useNotificationHub_1.useNotificationHub)();
    const isAnyConnected = chat.isConnected || notifications.isConnected;
    const allConnected = chat.isConnected && notifications.isConnected;
    const connectAll = async () => {
        await Promise.all([chat.connect(), notifications.connect()]);
    };
    const disconnectAll = async () => {
        await Promise.all([chat.disconnect(), notifications.disconnect()]);
    };
    return {
        chat,
        notifications,
        isAnyConnected,
        allConnected,
        connectAll,
        disconnectAll,
    };
}
//# sourceMappingURL=useMultipleHubs.js.map