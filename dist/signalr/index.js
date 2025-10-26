"use strict";
// src/signalr/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseUrl = exports.getHubConfigs = exports.DashboardHub = exports.NotificationHub = exports.ChatHub = exports.HubDebugger = exports.ConnectionStatus = exports.useNotificationHub = exports.useChatHub = exports.useHub = exports.useSignalRContext = exports.SignalRProvider = exports.SignalRHubManager = exports.BaseSignalRHub = void 0;
// Core
var abstractions_1 = require("./core/abstractions");
Object.defineProperty(exports, "BaseSignalRHub", { enumerable: true, get: function () { return abstractions_1.BaseSignalRHub; } });
Object.defineProperty(exports, "SignalRHubManager", { enumerable: true, get: function () { return abstractions_1.SignalRHubManager; } });
// Context
var SignalRProvider_1 = require("./context/SignalRProvider");
Object.defineProperty(exports, "SignalRProvider", { enumerable: true, get: function () { return SignalRProvider_1.SignalRProvider; } });
Object.defineProperty(exports, "useSignalRContext", { enumerable: true, get: function () { return SignalRProvider_1.useSignalRContext; } });
// Hooks
var useHub_1 = require("./hooks/useHub");
Object.defineProperty(exports, "useHub", { enumerable: true, get: function () { return useHub_1.useHub; } });
var useChatHub_1 = require("./hooks/useChatHub");
Object.defineProperty(exports, "useChatHub", { enumerable: true, get: function () { return useChatHub_1.useChatHub; } });
var useNotificationHub_1 = require("./hooks/useNotificationHub");
Object.defineProperty(exports, "useNotificationHub", { enumerable: true, get: function () { return useNotificationHub_1.useNotificationHub; } });
// Components
var ConnectionStatus_1 = require("./components/ConnectionStatus");
Object.defineProperty(exports, "ConnectionStatus", { enumerable: true, get: function () { return ConnectionStatus_1.ConnectionStatus; } });
var HubDebugger_1 = require("./components/HubDebugger");
Object.defineProperty(exports, "HubDebugger", { enumerable: true, get: function () { return HubDebugger_1.HubDebugger; } });
// Hubs (if you want to expose them)
var ChatHub_1 = require("./hubs/ChatHub");
Object.defineProperty(exports, "ChatHub", { enumerable: true, get: function () { return ChatHub_1.ChatHub; } });
var NotificationHub_1 = require("./hubs/NotificationHub");
Object.defineProperty(exports, "NotificationHub", { enumerable: true, get: function () { return NotificationHub_1.NotificationHub; } });
var DashboardHub_1 = require("./hubs/DashboardHub");
Object.defineProperty(exports, "DashboardHub", { enumerable: true, get: function () { return DashboardHub_1.DashboardHub; } });
// Config
var hubConfig_1 = require("./config/hubConfig");
Object.defineProperty(exports, "getHubConfigs", { enumerable: true, get: function () { return hubConfig_1.getHubConfigs; } });
Object.defineProperty(exports, "getBaseUrl", { enumerable: true, get: function () { return hubConfig_1.getBaseUrl; } });
//# sourceMappingURL=index.js.map