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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSignalRContext = exports.SignalRProvider = void 0;
// src/signalr/context/SignalRProvider.tsx
const react_1 = __importStar(require("react"));
const ChatHub_1 = require("../hubs/ChatHub");
const NotificationHub_1 = require("../hubs/NotificationHub");
const DashboardHub_1 = require("../hubs/DashboardHub");
const hubConfig_1 = require("../config/hubConfig");
const SignalRContext = (0, react_1.createContext)(undefined);
const SignalRProvider = ({ children, getAuthToken, autoConnect = true, enabledHubs, }) => {
    const hubs = (0, react_1.useRef)(new Map());
    const [isInitialized, setIsInitialized] = (0, react_1.useState)(false);
    const registerHub = (0, react_1.useCallback)((name, hub) => {
        hubs.current.set(name, hub);
    }, []);
    const unregisterHub = (0, react_1.useCallback)((name) => {
        const hub = hubs.current.get(name);
        if (hub) {
            hub.stop();
            hub.dispose();
            hubs.current.delete(name);
        }
    }, []);
    const getHub = (0, react_1.useCallback)((name) => {
        return hubs.current.get(name);
    }, []);
    (0, react_1.useEffect)(() => {
        const baseUrl = (0, hubConfig_1.getBaseUrl)();
        const configs = (0, hubConfig_1.getHubConfigs)(baseUrl, getAuthToken);
        // Initialize hubs based on configuration
        const hubFactories = {
            chat: (config) => new ChatHub_1.ChatHub(config),
            notifications: (config) => new NotificationHub_1.NotificationHub(config),
            dashboard: (config) => new DashboardHub_1.DashboardHub(config),
        };
        // Create and register hubs
        Object.entries(configs).forEach(([name, config]) => {
            if (config.enabled && (!enabledHubs || enabledHubs.includes(name))) {
                const factory = hubFactories[name];
                if (factory) {
                    const hub = factory(config);
                    registerHub(name, hub);
                    if (autoConnect) {
                        hub.start().catch((error) => {
                            console.error(`Failed to start ${name} hub:`, error);
                        });
                    }
                }
            }
        });
        setIsInitialized(true);
        // Cleanup
        return () => {
            hubs.current.forEach((hub) => {
                hub.stop();
                hub.dispose();
            });
            hubs.current.clear();
        };
    }, [getAuthToken, autoConnect, enabledHubs, registerHub]);
    const contextValue = {
        hubs: hubs.current,
        registerHub,
        unregisterHub,
        getHub,
    };
    return (react_1.default.createElement(SignalRContext.Provider, { value: contextValue }, isInitialized ? children : null));
};
exports.SignalRProvider = SignalRProvider;
const useSignalRContext = () => {
    const context = (0, react_1.useContext)(SignalRContext);
    if (!context) {
        throw new Error('useSignalRContext must be used within SignalRProvider');
    }
    return context;
};
exports.useSignalRContext = useSignalRContext;
//# sourceMappingURL=SignalRProvider.js.map