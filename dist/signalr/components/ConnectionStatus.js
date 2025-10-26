"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionStatus = void 0;
// src/signalr/components/ConnectionStatus.tsx
const react_1 = __importDefault(require("react"));
const ConnectionStatus = ({ hubName, connectionState, onReconnect, className = '', }) => {
    const { isConnected, isConnecting, error } = connectionState;
    const getStatusColor = () => {
        if (isConnected)
            return 'bg-green-500';
        if (isConnecting)
            return 'bg-yellow-500';
        if (error)
            return 'bg-red-500';
        return 'bg-gray-500';
    };
    const getStatusText = () => {
        if (isConnected)
            return 'Connected';
        if (isConnecting)
            return 'Connecting...';
        if (error)
            return 'Disconnected';
        return 'Not Connected';
    };
    return (react_1.default.createElement("div", { className: `flex items-center space-x-2 ${className}` },
        react_1.default.createElement("div", { className: `w-2 h-2 rounded-full ${getStatusColor()}` }),
        react_1.default.createElement("span", { className: "text-sm text-gray-600" },
            hubName,
            ": ",
            getStatusText()),
        error && onReconnect && (react_1.default.createElement("button", { onClick: onReconnect, className: "text-xs text-blue-500 hover:text-blue-700" }, "Reconnect"))));
};
exports.ConnectionStatus = ConnectionStatus;
//# sourceMappingURL=ConnectionStatus.js.map