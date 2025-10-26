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
exports.ChatScreen = void 0;
// src/screens/ChatScreen.tsx
const react_1 = __importStar(require("react"));
const signalr_1 = require("../signalr");
const ConnectionStatus_1 = require("../signalr/components/ConnectionStatus");
const ChatScreen = () => {
    const { messages, currentRoom, users, isConnected, connectionState, joinRoom, sendMessage, setTyping, connect, } = (0, signalr_1.useChatHub)({
        autoJoinRoom: 'general',
        onMessageReceived: (message) => {
            console.log('New message:', message);
        },
    });
    const [inputText, setInputText] = (0, react_1.useState)('');
    const handleSend = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!inputText.trim())
            return;
        try {
            yield sendMessage(inputText);
            setInputText('');
        }
        catch (error) {
            console.error('Failed to send message:', error);
        }
    });
    const handleInputChange = (text) => {
        setInputText(text);
        setTyping(text.length > 0);
    };
    return (react_1.default.createElement("div", { className: "chat-screen" },
        react_1.default.createElement("div", { className: "chat-header" },
            react_1.default.createElement("h2", null,
                "Chat Room: ",
                currentRoom || 'None'),
            react_1.default.createElement(ConnectionStatus_1.ConnectionStatus, { hubName: "Chat", connectionState: connectionState, onReconnect: connect })),
        react_1.default.createElement("div", { className: "chat-users" },
            react_1.default.createElement("h3", null,
                "Online Users (",
                users.length,
                ")"),
            users.map((user) => (react_1.default.createElement("div", { key: user }, user)))),
        react_1.default.createElement("div", { className: "chat-messages" }, messages.map((msg, idx) => (react_1.default.createElement("div", { key: idx, className: "message" },
            react_1.default.createElement("strong", null,
                msg.user,
                ":"),
            " ",
            msg.text,
            react_1.default.createElement("span", { className: "timestamp" }, new Date(msg.timestamp).toLocaleTimeString()))))),
        react_1.default.createElement("div", { className: "chat-input" },
            react_1.default.createElement("input", { type: "text", value: inputText, onChange: (e) => handleInputChange(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSend(), placeholder: "Type a message...", disabled: !isConnected }),
            react_1.default.createElement("button", { onClick: handleSend, disabled: !isConnected }, "Send"))));
};
exports.ChatScreen = ChatScreen;
