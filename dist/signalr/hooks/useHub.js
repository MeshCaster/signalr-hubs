"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHub = useHub;
// src/signalr/hooks/useHub.ts
const react_1 = require("react");
const SignalRProvider_1 = require("../context/SignalRProvider");
function useHub(hubName, options = {}) {
    const { autoConnect = true, reconnectOnMount = false } = options;
    const { getHub } = (0, SignalRProvider_1.useSignalRContext)();
    const hub = getHub(hubName);
    const [connectionState, setConnectionState] = (0, react_1.useState)({
        isConnected: false,
        isConnecting: false,
        error: null,
        connectionId: null,
    });
    const eventHandlersRef = (0, react_1.useRef)([]);
    if (!hub) {
        throw new Error(`Hub "${hubName}" not found. Make sure it's registered in SignalRProvider.`);
    }
    const updateConnectionState = (0, react_1.useCallback)((updates) => {
        setConnectionState((prev) => ({ ...prev, ...updates }));
    }, []);
    const connect = (0, react_1.useCallback)(async () => {
        if (connectionState.isConnecting || connectionState.isConnected) {
            return;
        }
        updateConnectionState({ isConnecting: true, error: null });
        try {
            await hub.start();
            updateConnectionState({
                isConnected: true,
                isConnecting: false,
                connectionId: hub.connectionId,
            });
        }
        catch (error) {
            updateConnectionState({
                isConnected: false,
                isConnecting: false,
                error: error,
            });
            throw error;
        }
    }, [hub, connectionState.isConnecting, connectionState.isConnected, updateConnectionState]);
    const disconnect = (0, react_1.useCallback)(async () => {
        try {
            await hub.stop();
            updateConnectionState({
                isConnected: false,
                connectionId: null,
            });
        }
        catch (error) {
            console.error('Error disconnecting from hub:', error);
        }
    }, [hub, updateConnectionState]);
    const invoke = (0, react_1.useCallback)(async (methodName, ...args) => {
        if (!connectionState.isConnected) {
            throw new Error('Hub is not connected');
        }
        return hub.invoke(methodName, ...args);
    }, [hub, connectionState.isConnected]);
    const on = (0, react_1.useCallback)((methodName, handler) => {
        const subscription = hub.on(methodName, handler);
        eventHandlersRef.current.push({
            event: methodName,
            handler,
        });
        return subscription;
    }, [hub]);
    // Setup connection state listeners
    (0, react_1.useEffect)(() => {
        const unsubscribeConnected = hub.onConnectedCallback(() => {
            updateConnectionState({
                isConnected: true,
                isConnecting: false,
                connectionId: hub.connectionId,
                error: null,
            });
        });
        const unsubscribeDisconnected = hub.onDisconnectedCallback(() => {
            updateConnectionState({
                isConnected: false,
                connectionId: null,
            });
        });
        const unsubscribeReconnecting = hub.onReconnectingCallback((error) => {
            updateConnectionState({
                isConnected: false,
                error,
            });
        });
        const unsubscribeReconnected = hub.onReconnectedCallback(() => {
            updateConnectionState({
                isConnected: true,
                connectionId: hub.connectionId,
                error: null,
            });
        });
        const unsubscribeClose = hub.onCloseCallback((error) => {
            updateConnectionState({
                isConnected: false,
                connectionId: null,
                error,
            });
        });
        return () => {
            unsubscribeConnected();
            unsubscribeDisconnected();
            unsubscribeReconnecting();
            unsubscribeReconnected();
            unsubscribeClose();
        };
    }, [hub, updateConnectionState]);
    // Auto-connect on mount
    (0, react_1.useEffect)(() => {
        if (autoConnect || reconnectOnMount) {
            connect();
        }
        return () => {
            // Cleanup event handlers
            eventHandlersRef.current.forEach(({ event, handler }) => {
                hub.off(event, handler);
            });
            eventHandlersRef.current = [];
        };
    }, [autoConnect, reconnectOnMount, connect, hub]);
    return {
        hub,
        connectionState,
        connect,
        disconnect,
        invoke,
        on,
        isConnected: connectionState.isConnected,
        isConnecting: connectionState.isConnecting,
        error: connectionState.error,
        connectionId: connectionState.connectionId,
    };
}
//# sourceMappingURL=useHub.js.map