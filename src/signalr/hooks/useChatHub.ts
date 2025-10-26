// src/signalr/hooks/useChatHub.ts
import { useCallback, useEffect, useState } from 'react';
import { ChatHub } from '../hubs/ChatHub';
import { useHub } from './useHub';

export interface Message {
    user: string;
    text: string;
    timestamp: Date;
}

export interface UseChatHubOptions {
    autoJoinRoom?: string;
    onMessageReceived?: (message: Message) => void;
    onUserJoined?: (user: string) => void;
    onUserLeft?: (user: string) => void;
}

export function useChatHub(options: UseChatHubOptions = {}) {
    const { autoJoinRoom, onMessageReceived, onUserJoined, onUserLeft } = options;

    const { hub, connectionState, connect, disconnect, invoke, on, isConnected } =
        useHub<ChatHub>('chat');

    const [messages, setMessages] = useState<Message[]>([]);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [users, setUsers] = useState<string[]>([]);

    // Subscribe to hub events
    useEffect(() => {
        const subscriptions = [
            on('ReceiveMessage', (user: string, message: string, timestamp: Date) => {
                const msg: Message = { user, text: message, timestamp };
                setMessages((prev) => [...prev, msg]);
                onMessageReceived?.(msg);
            }),

            on('UserJoined', (user: string) => {
                setUsers((prev) => [...prev, user]);
                onUserJoined?.(user);
            }),

            on('UserLeft', (user: string) => {
                setUsers((prev) => prev.filter((u) => u !== user));
                onUserLeft?.(user);
            }),
        ];

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [on, onMessageReceived, onUserJoined, onUserLeft]);

    // Auto-join room when connected
    useEffect(() => {
        if (isConnected && autoJoinRoom) {
            joinRoom(autoJoinRoom);
        }
    }, [isConnected, autoJoinRoom]);

    const joinRoom = useCallback(
        async (roomName: string) => {
            try {
                const success = await invoke('JoinRoom', roomName);
                if (success) {
                    setCurrentRoom(roomName);
                    setMessages([]);
                    // Fetch online users
                    const onlineUsers = await invoke('GetOnlineUsers');
                    setUsers(onlineUsers);
                }
                return success;
            } catch (error) {
                console.error('Failed to join room:', error);
                throw error;
            }
        },
        [invoke]
    );

    const leaveRoom = useCallback(async () => {
        if (!currentRoom) return;

        try {
            await invoke('LeaveRoom', currentRoom);
            setCurrentRoom(null);
            setMessages([]);
            setUsers([]);
        } catch (error) {
            console.error('Failed to leave room:', error);
            throw error;
        }
    }, [currentRoom, invoke]);

    const sendMessage = useCallback(
        async (message: string) => {
            if (!currentRoom) {
                throw new Error('Not in a room');
            }

            try {
                await invoke('SendMessage', message);
            } catch (error) {
                console.error('Failed to send message:', error);
                throw error;
            }
        },
        [currentRoom, invoke]
    );

    const setTyping = useCallback(
        async (isTyping: boolean) => {
            try {
                await invoke('SetTyping', isTyping);
            } catch (error) {
                console.error('Failed to set typing status:', error);
            }
        },
        [invoke]
    );

    return {
        // Connection state
        isConnected,
        connectionState,
        connect,
        disconnect,

        // Chat-specific state
        messages,
        currentRoom,
        users,

        // Chat actions
        joinRoom,
        leaveRoom,
        sendMessage,
        setTyping,

        // Clear messages
        clearMessages: () => setMessages([]),
    };
}