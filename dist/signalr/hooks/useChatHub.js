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
                onMessageReceived === null || onMessageReceived === void 0 ? void 0 : onMessageReceived(msg);
            }),
            on('UserJoined', (user) => {
                setUsers((prev) => [...prev, user]);
                onUserJoined === null || onUserJoined === void 0 ? void 0 : onUserJoined(user);
            }),
            on('UserLeft', (user) => {
                setUsers((prev) => prev.filter((u) => u !== user));
                onUserLeft === null || onUserLeft === void 0 ? void 0 : onUserLeft(user);
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
    const joinRoom = (0, react_1.useCallback)((roomName) => __awaiter(this, void 0, void 0, function* () {
        try {
            const success = yield invoke('JoinRoom', roomName);
            if (success) {
                setCurrentRoom(roomName);
                setMessages([]);
                // Fetch online users
                const onlineUsers = yield invoke('GetOnlineUsers');
                setUsers(onlineUsers);
            }
            return success;
        }
        catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    }), [invoke]);
    const leaveRoom = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!currentRoom)
            return;
        try {
            yield invoke('LeaveRoom', currentRoom);
            setCurrentRoom(null);
            setMessages([]);
            setUsers([]);
        }
        catch (error) {
            console.error('Failed to leave room:', error);
            throw error;
        }
    }), [currentRoom, invoke]);
    const sendMessage = (0, react_1.useCallback)((message) => __awaiter(this, void 0, void 0, function* () {
        if (!currentRoom) {
            throw new Error('Not in a room');
        }
        try {
            yield invoke('SendMessage', message);
        }
        catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }), [currentRoom, invoke]);
    const setTyping = (0, react_1.useCallback)((isTyping) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield invoke('SetTyping', isTyping);
        }
        catch (error) {
            console.error('Failed to set typing status:', error);
        }
    }), [invoke]);
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
