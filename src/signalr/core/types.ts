// src/signalr/core/types.ts

export interface HubConfig {
    url: string;
    hubName: string;
    accessTokenFactory?: () => string | Promise<string>;
    automaticReconnect?: boolean | number[];
    enabled?: boolean;
}

export interface SignalRContextValue {
    hubs: Map<string, any>;
    registerHub: <T>(name: string, hub: T) => void;
    unregisterHub: (name: string) => void;
    getHub: <T>(name: string) => T | undefined;
}

export interface ConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
    connectionId: string | null;
}

export interface HubEventHandler<T = any> {
    event: string;
    handler: (...args: any[]) => T | Promise<T>;
}