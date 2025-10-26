// src/screens/ChatScreen.tsx
import React, { useState } from 'react';
import { useChatHub } from '../signalr';
import { ConnectionStatus } from '../signalr/components/ConnectionStatus';

export const ChatScreen: React.FC = () => {
    const {
        messages,
        currentRoom,
        users,
        isConnected,
        connectionState,
        joinRoom,
        sendMessage,
        setTyping,
        connect,
    } = useChatHub({
        autoJoinRoom: 'general',
        onMessageReceived: (message) => {
            console.log('New message:', message);
        },
    });

    const [inputText, setInputText] = useState('');

    const handleSend = async () => {
        if (!inputText.trim()) return;

        try {
            await sendMessage(inputText);
            setInputText('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleInputChange = (text: string) => {
        setInputText(text);
        setTyping(text.length > 0);
    };

    return (
        <div className="chat-screen">
            <div className="chat-header">
                <h2>Chat Room: {currentRoom || 'None'}</h2>
                <ConnectionStatus
                    hubName="Chat"
                    connectionState={connectionState}
                    onReconnect={connect}
                />
            </div>

            <div className="chat-users">
                <h3>Online Users ({users.length})</h3>
                {users.map((user) => (
                    <div key={user}>{user}</div>
                ))}
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className="message">
                        <strong>{msg.user}:</strong> {msg.text}
                        <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                />
                <button onClick={handleSend} disabled={!isConnected}>
                    Send
                </button>
            </div>
        </div>
    );
};