"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChatHub = useChatHub;
// src/signalr/hooks/useChatHub.ts
const react_1 = require("react");
const useHub_1 = require("./useHub");
function useChatHub(options = {}) {
    const { autoJoinRoom, onMessageReceived, onUserJoined, onUserLeft } = options;
    const { hub, connectionState, connect, disconnect, invoke, on, isConnected } = (0, useHub_1.useHub)('chat');
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [currentRoom, setCurrentRoom] = (0, react_1.useState)(null);
    const [users, setUsers] = (0, react_1.useState)([]);
    // Subscribe to hub events
    (0, react_1.useEffect)(() => {
        const subscriptions = [
            on('ReceiveMessage', (user, message, timestamp) => {
                const msg = { user, text: message, timestamp };
                setMessages((prev) => [...prev, msg]);
                onMessageReceived?.(msg);
            }),
            on('UserJoined', (user) => {
                setUsers((prev) => [...prev, user]);
                onUserJoined?.(user);
            }),
            on('UserLeft', (user) => {
                setUsers((prev) => prev.filter((u) => u !== user));
                onUserLeft?.(user);
            }),
        ];
        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [on, onMessageReceived, onUserJoined, onUserLeft]);
    // Auto-join room when connected
    (0, react_1.useEffect)(() => {
        if (isConnected && autoJoinRoom) {
            joinRoom(autoJoinRoom);
        }
    }, [isConnected, autoJoinRoom]);
    const joinRoom = (0, react_1.useCallback)(async (roomName) => {
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
        }
        catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    }, [invoke]);
    const leaveRoom = (0, react_1.useCallback)(async () => {
        if (!currentRoom)
            return;
        try {
            await invoke('LeaveRoom', currentRoom);
            setCurrentRoom(null);
            setMessages([]);
            setUsers([]);
        }
        catch (error) {
            console.error('Failed to leave room:', error);
            throw error;
        }
    }, [currentRoom, invoke]);
    const sendMessage = (0, react_1.useCallback)(async (message) => {
        if (!currentRoom) {
            throw new Error('Not in a room');
        }
        try {
            await invoke('SendMessage', message);
        }
        catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }, [currentRoom, invoke]);
    const setTyping = (0, react_1.useCallback)(async (isTyping) => {
        try {
            await invoke('SetTyping', isTyping);
        }
        catch (error) {
            console.error('Failed to set typing status:', error);
        }
    }, [invoke]);
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
//# sourceMappingURL=useChatHub.js.map