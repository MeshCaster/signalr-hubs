import * as signalR from '@microsoft/signalr';

/**
 * Base configuration for SignalR connection
 */
export interface SignalRConfig {
    url: string;
    hubName?: string;
    accessTokenFactory?: () => string | Promise<string>;
    automaticReconnect?: boolean | number[];
    skipNegotiation?: boolean;
    transport?: signalR.HttpTransportType;
    logLevel?: signalR.LogLevel;
}

/**
 * Connection state enum
 */
export enum ConnectionState {
    Disconnected = 'Disconnected',
    Connecting = 'Connecting',
    Connected = 'Connected',
    Reconnecting = 'Reconnecting',
    Disconnecting = 'Disconnecting'
}

/**
 * Event handler types for hub methods
 */
export type HubMethodHandler<T = any> = (...args: any[]) => T | Promise<T>;
export type ConnectionHandler = () => void | Promise<void>;
export type ErrorHandler = (error: Error) => void | Promise<void>;

/**
 * Hub method subscription interface
 */
export interface HubSubscription {
    methodName: string;
    unsubscribe: () => void;
}

/**
 * Generic hub event map - extend this for type safety
 */
export interface HubEventMap {
    [methodName: string]: (...args: any[]) => void;
}

/**
 * Hub invoke methods map - extend this for type safety
 */
export interface HubInvokeMap {
    [methodName: string]: (...args: any[]) => Promise<any>;
}

/**
 * Base SignalR Hub Client abstraction
 */
export abstract class BaseSignalRHub<
    TEventMap extends HubEventMap = HubEventMap,
    TInvokeMap extends HubInvokeMap = HubInvokeMap
> {
    protected connection: signalR.HubConnection;
    protected config: SignalRConfig;
    protected subscriptions: Map<string, HubSubscription[]> = new Map();
    private _state: ConnectionState = ConnectionState.Disconnected;
    private connectionHandlers: ConnectionHandler[] = [];
    private disconnectionHandlers: ConnectionHandler[] = [];
    private reconnectingHandlers: ErrorHandler[] = [];
    private reconnectedHandlers: ConnectionHandler[] = [];
    private closeHandlers: ErrorHandler[] = [];

    constructor(config: SignalRConfig) {
        this.config = config;
        this.connection = this.buildConnection(config);
        this.setupConnectionHandlers();
    }

    /**
     * Build the SignalR connection with configuration
     */
    protected buildConnection(config: SignalRConfig): signalR.HubConnection {
        const builder = new signalR.HubConnectionBuilder()
            .withUrl(config.url, {
                accessTokenFactory: config.accessTokenFactory,
                skipNegotiation: config.skipNegotiation,
                transport: config.transport,
            });

        if (config.automaticReconnect !== false) {
            if (Array.isArray(config.automaticReconnect)) {
                // Pass array of retry delays
                builder.withAutomaticReconnect(config.automaticReconnect);
            } else if (config.automaticReconnect === true) {
                // Use default reconnect policy
                builder.withAutomaticReconnect();
            }
            // If undefined, don't call withAutomaticReconnect at all
        }

        if (config.logLevel !== undefined) {
            builder.configureLogging(config.logLevel);
        }

        return builder.build();
    }

    /**
     * Setup internal connection lifecycle handlers
     */
    protected setupConnectionHandlers(): void {
        this.connection.onclose((error) => {
            this._state = ConnectionState.Disconnected;
            this.closeHandlers.forEach((handler) => handler(error || new Error('Connection closed')));
            this.onDisconnected();
        });

        this.connection.onreconnecting((error) => {
            this._state = ConnectionState.Reconnecting;
            this.reconnectingHandlers.forEach((handler) =>
                handler(error || new Error('Reconnecting'))
            );
            this.onReconnecting(error);
        });

        this.connection.onreconnected(() => {
            this._state = ConnectionState.Connected;
            this.reconnectedHandlers.forEach((handler) => handler());
            this.onReconnected();
        });
    }

    /**
     * Lifecycle hooks - override in derived classes
     */
    protected onConnected(): void | Promise<void> {}
    protected onDisconnected(): void | Promise<void> {}
    protected onReconnecting(error?: Error): void | Promise<void> {}
    protected onReconnected(): void | Promise<void> {}

    /**
     * Start the connection
     */
    async start(): Promise<void> {
        if (this._state === ConnectionState.Connected ||
            this._state === ConnectionState.Connecting) {
            return;
        }

        this._state = ConnectionState.Connecting;

        try {
            await this.connection.start();
            this._state = ConnectionState.Connected;
            this.connectionHandlers.forEach((handler) => handler());
            await this.onConnected();
        } catch (error) {
            this._state = ConnectionState.Disconnected;
            throw error;
        }
    }

    /**
     * Stop the connection
     */
    async stop(): Promise<void> {
        if (this._state === ConnectionState.Disconnected) {
            return;
        }

        this._state = ConnectionState.Disconnecting;

        try {
            await this.connection.stop();
            this._state = ConnectionState.Disconnected;
            this.disconnectionHandlers.forEach((handler) => handler());
        } catch (error) {
            this._state = ConnectionState.Disconnected;
            throw error;
        }
    }

    /**
     * Subscribe to a hub method (server -> client)
     */
    on<K extends keyof TEventMap>(
        methodName: K,
        handler: TEventMap[K]
    ): HubSubscription {
        const subscription: HubSubscription = {
            methodName: methodName as string,
            unsubscribe: () => this.off(methodName, handler),
        };

        this.connection.on(methodName as string, handler as HubMethodHandler);

        if (!this.subscriptions.has(methodName as string)) {
            this.subscriptions.set(methodName as string, []);
        }
        this.subscriptions.get(methodName as string)!.push(subscription);

        return subscription;
    }

    /**
     * Unsubscribe from a hub method
     */
    off<K extends keyof TEventMap>(
        methodName: K,
        handler?: TEventMap[K]
    ): void {
        if (handler) {
            this.connection.off(methodName as string, handler as HubMethodHandler);
        } else {
            this.connection.off(methodName as string);
        }

        if (!handler) {
            this.subscriptions.delete(methodName as string);
        } else {
            const subs = this.subscriptions.get(methodName as string);
            if (subs) {
                const filtered = subs.filter(
                    (s) => s.methodName !== (methodName as string)
                );
                if (filtered.length > 0) {
                    this.subscriptions.set(methodName as string, filtered);
                } else {
                    this.subscriptions.delete(methodName as string);
                }
            }
        }
    }

    /**
     * Invoke a hub method (client -> server)
     */
    async invoke<K extends keyof TInvokeMap>(
        methodName: K,
        ...args: Parameters<TInvokeMap[K]>
    ): Promise<ReturnType<TInvokeMap[K]>> {
        return this.connection.invoke(methodName as string, ...args);
    }

    /**
     * Send a hub method without waiting for response (client -> server)
     */
    async send<K extends keyof TInvokeMap>(
        methodName: K,
        ...args: Parameters<TInvokeMap[K]>
    ): Promise<void> {
        return this.connection.send(methodName as string, ...args);
    }

    /**
     * Stream from server
     */
    stream<T = any>(methodName: string, ...args: any[]): signalR.IStreamResult<T> {
        return this.connection.stream<T>(methodName, ...args);
    }

    /**
     * Register a connection opened handler
     */
    onConnectedCallback(handler: ConnectionHandler): () => void {
        this.connectionHandlers.push(handler);
        return () => {
            this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Register a disconnection handler
     */
    onDisconnectedCallback(handler: ConnectionHandler): () => void {
        this.disconnectionHandlers.push(handler);
        return () => {
            this.disconnectionHandlers = this.disconnectionHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Register a reconnecting handler
     */
    onReconnectingCallback(handler: ErrorHandler): () => void {
        this.reconnectingHandlers.push(handler);
        return () => {
            this.reconnectingHandlers = this.reconnectingHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Register a reconnected handler
     */
    onReconnectedCallback(handler: ConnectionHandler): () => void {
        this.reconnectedHandlers.push(handler);
        return () => {
            this.reconnectedHandlers = this.reconnectedHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Register a close handler
     */
    onCloseCallback(handler: ErrorHandler): () => void {
        this.closeHandlers.push(handler);
        return () => {
            this.closeHandlers = this.closeHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Get current connection state
     */
    get state(): ConnectionState {
        return this._state;
    }

    /**
     * Get current SignalR connection state
     */
    get connectionState(): signalR.HubConnectionState {
        return this.connection.state;
    }

    /**
     * Check if connected
     */
    get isConnected(): boolean {
        return this._state === ConnectionState.Connected;
    }

    /**
     * Get the connection ID
     */
    get connectionId(): string | null {
        return this.connection.connectionId;
    }

    /**
     * Clean up all subscriptions
     */
    dispose(): void {
        this.subscriptions.forEach((subs, methodName) => {
            this.connection.off(methodName);
        });
        this.subscriptions.clear();
        this.connectionHandlers = [];
        this.disconnectionHandlers = [];
        this.reconnectingHandlers = [];
        this.reconnectedHandlers = [];
        this.closeHandlers = [];
    }
}

/**
 * Hub connection manager for multiple hubs
 */
export class SignalRHubManager {
    private hubs: Map<string, BaseSignalRHub> = new Map();

    register<T extends BaseSignalRHub>(name: string, hub: T): void {
        this.hubs.set(name, hub);
    }

    unregister(name: string): void {
        const hub = this.hubs.get(name);
        if (hub) {
            hub.dispose();
            this.hubs.delete(name);
        }
    }

    get<T extends BaseSignalRHub>(name: string): T | undefined {
        return this.hubs.get(name) as T | undefined;
    }

    async startAll(): Promise<void> {
        await Promise.all(
            Array.from(this.hubs.values()).map((hub) => hub.start())
        );
    }

    async stopAll(): Promise<void> {
        await Promise.all(
            Array.from(this.hubs.values()).map((hub) => hub.stop())
        );
    }

    disposeAll(): void {
        this.hubs.forEach((hub) => hub.dispose());
        this.hubs.clear();
    }
}