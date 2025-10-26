"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/App.tsx
const react_1 = __importDefault(require("react"));
const signalr_1 = require("./signalr");
const ChatScreen_1 = require("./screens/ChatScreen");
const NotificationBell_1 = require("./signalr/components/NotificationBell");
function App() {
    const getAuthToken = () => {
        // Your auth logic here
        return localStorage.getItem('authToken') || '';
    };
    return (react_1.default.createElement(signalr_1.SignalRProvider, { getAuthToken: getAuthToken, autoConnect: true, enabledHubs: ['chat', 'notifications'] },
        react_1.default.createElement("div", { className: "app" },
            react_1.default.createElement("header", null,
                react_1.default.createElement("h1", null, "My App"),
                react_1.default.createElement(NotificationBell_1.NotificationBell, null)),
            react_1.default.createElement("main", null,
                react_1.default.createElement(ChatScreen_1.ChatScreen, null)),
            react_1.default.createElement(signalr_1.HubDebugger, null))));
}
exports.default = App;
