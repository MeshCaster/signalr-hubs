// src/signalr/hooks/usePersistentChatHub.ts
import { useEffect } from 'react';
import { useChatHub, UseChatHubOptions } from './useChatHub';

const STORAGE_KEY = 'chat_messages';

export function usePersistentChatHub(options: UseChatHubOptions = {}) {
    const chatHub = useChatHub(options);

    // Load messages from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const messages = JSON.parse(stored);
                // You'd need to add a setMessages method to useChatHub
                // or handle this differently
            } catch (error) {
                console.error('Failed to load stored messages:', error);
            }
        }
    }, []);

    // Save messages to storage when they change
    useEffect(() => {
        if (chatHub.messages.length > 0) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(chatHub.messages.slice(-50)) // Keep last 50
            );
        }
    }, [chatHub.messages]);

    return chatHub;
}