"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePersistentChatHub = usePersistentChatHub;
// src/signalr/hooks/usePersistentChatHub.ts
const react_1 = require("react");
const useChatHub_1 = require("./useChatHub");
const STORAGE_KEY = 'chat_messages';
function usePersistentChatHub(options = {}) {
    const chatHub = (0, useChatHub_1.useChatHub)(options);
    // Load messages from storage on mount
    (0, react_1.useEffect)(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const messages = JSON.parse(stored);
                // You'd need to add a setMessages method to useChatHub
                // or handle this differently
            }
            catch (error) {
                console.error('Failed to load stored messages:', error);
            }
        }
    }, []);
    // Save messages to storage when they change
    (0, react_1.useEffect)(() => {
        if (chatHub.messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHub.messages.slice(-50)) // Keep last 50
            );
        }
    }, [chatHub.messages]);
    return chatHub;
}
