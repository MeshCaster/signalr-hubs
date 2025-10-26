// src/signalr/index.ts

// Core
export { BaseSignalRHub, SignalRHubManager } from './core/abstractions';
export type {
    SignalRConfig,
    HubEventMap,
    HubInvokeMap,
    ConnectionState as HubConnectionState,
} from './core/abstractions';

export type {
    HubConnection,
    IHttpConnectionOptions,
    IRetryPolicy,
    IStreamResult,
    ISubscription,
    LogLevel,
} from '@microsoft/signalr';

// Types
export type { HubConfig, SignalRContextValue, ConnectionState } from './core/types';

// Context
export { SignalRProvider, useSignalRContext } from './context/SignalRProvider';

// Hooks
export { useHub } from './hooks/useHub';
export { useChatHub } from './hooks/useChatHub';
export { useNotificationHub } from './hooks/useNotificationHub';

// Components
export { ConnectionStatus } from './components/ConnectionStatus';
export { HubDebugger } from './components/HubDebugger';

// Hubs (if you want to expose them)
export { ChatHub } from './hubs/ChatHub';
export { NotificationHub } from './hubs/NotificationHub';
export { DashboardHub } from './hubs/DashboardHub';

// Config
export { getHubConfigs, getBaseUrl } from './config/hubConfig';