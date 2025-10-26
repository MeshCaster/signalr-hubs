// src/signalr/hooks/useMultipleHubs.ts
import { useChatHub } from './useChatHub';
import { useNotificationHub } from './useNotificationHub';

export function useMultipleHubs() {
    const chat = useChatHub();
    const notifications = useNotificationHub();

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