// src/signalr/hooks/useHub.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { BaseSignalRHub } from '../core/abstractions';
import { useSignalRContext } from '../context/SignalRProvider';
import { ConnectionState, HubEventHandler } from '../core/types';

export interface UseHubOptions {
    autoConnect?: boolean;
    reconnectOnMount?: boolean;
}

export function useHub<T extends BaseSignalRHub>(
    hubName: string,
    options: UseHubOptions = {}
) {
    const { autoConnect = true, reconnectOnMount = false } = options;
    const { getHub } = useSignalRContext();
    const hub = getHub<T>(hubName);

    const [connectionState, setConnectionState] = useState<ConnectionState>({
        isConnected: false,
        isConnecting: false,
        error: null,
        connectionId: null,
    });

    const eventHandlersRef = useRef<HubEventHandler[]>([]);

    if (!hub) {
        throw new Error(`Hub "${hubName}" not found. Make sure it's registered in SignalRProvider.`);
    }

    const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
        setConnectionState((prev) => ({ ...prev, ...updates }));
    }, []);

    const connect = useCallback(async () => {
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
        } catch (error) {
            updateConnectionState({
                isConnected: false,
                isConnecting: false,
                error: error as Error,
            });
            throw error;
        }
    }, [hub, connectionState.isConnecting, connectionState.isConnected, updateConnectionState]);

    const disconnect = useCallback(async () => {
        try {
            await hub.stop();
            updateConnectionState({
                isConnected: false,
                connectionId: null,
            });
        } catch (error) {
            console.error('Error disconnecting from hub:', error);
        }
    }, [hub, updateConnectionState]);

    const invoke = useCallback(
        async <K extends string>(methodName: K, ...args: any[]) => {
            if (!connectionState.isConnected) {
                throw new Error('Hub is not connected');
            }
            return (hub as any).invoke(methodName, ...args);
        },
        [hub, connectionState.isConnected]
    );

    const on = useCallback(
        <K extends string>(methodName: K, handler: (...args: any[]) => void) => {
            const subscription = (hub as any).on(methodName, handler);
            eventHandlersRef.current.push({
                event: methodName,
                handler,
            });
            return subscription;
        },
        [hub]
    );

    // Setup connection state listeners
    useEffect(() => {
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
    useEffect(() => {
        if (autoConnect || reconnectOnMount) {
            connect();
        }

        return () => {
            // Cleanup event handlers
            eventHandlersRef.current.forEach(({ event, handler }) => {
                (hub as any).off(event, handler);
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